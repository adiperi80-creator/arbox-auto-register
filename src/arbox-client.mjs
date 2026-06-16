const BASE_URL = 'https://apiappv2.arboxapp.com/api/v2';

const HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json, text/plain, */*',
};

async function request(path, { method = 'GET', body, token, refreshToken } = {}) {
  const headers = { ...HEADERS };
  if (token) headers.accesstoken = token;
  if (refreshToken) headers.refreshtoken = refreshToken;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json();
  if (!res.ok || json.error) {
    const msg = json.error?.messageToUser || json.error?.message || JSON.stringify(json.error) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json.data;
}

export async function login(email, password) {
  const data = await request('/user/login', {
    method: 'POST',
    body: { email, password },
  });

  const box = data.users_boxes?.[0];
  if (!box) throw new Error('No gym (box) found on your account');

  return {
    token: data.token,
    refreshToken: data.refreshToken,
    userId: data.id,
    boxId: box.box.id,
    locationBoxId: box.locations_box.id,
    userName: data.full_name,
  };
}

export async function getMembership(auth) {
  const data = await request(`/boxes/${auth.boxId}/memberships/${auth.locationBoxId}`, {
    token: auth.token,
    refreshToken: auth.refreshToken,
  });

  const active = data.find(m => m.status === 'active') || data[0];
  if (!active) throw new Error('No active membership found');
  return active.id;
}

export async function getSchedule(auth, fromDate, toDate) {
  return request('/schedule/betweenDates', {
    method: 'POST',
    token: auth.token,
    refreshToken: auth.refreshToken,
    body: {
      from: `${fromDate}T00:00:00.000Z`,
      to: `${toDate}T23:59:59.999Z`,
      locations_box_id: auth.locationBoxId,
      boxes_id: auth.boxId,
    },
  });
}

export async function registerForClass(auth, scheduleId, membershipUserId) {
  return request('/scheduleUser/insert', {
    method: 'POST',
    token: auth.token,
    refreshToken: auth.refreshToken,
    body: {
      schedule_id: scheduleId,
      membership_user_id: membershipUserId,
      extras: null,
    },
  });
}
