const ADAPTER_URL = process.env.ADAPTER_URL || 'http://localhost:9007/gateway';
const cmId = process.env.CM_ID || 'sbx';

const HEALTH_URL = {
  AUTH_FETCH_MODES: ADAPTER_URL + '/v0.5/users/auth/fetch-modes',
  AUTH_INIT: ADAPTER_URL + '/v0.5/users/auth/init',
  AUTH_CONFIRM: ADAPTER_URL + '/v0.5/users/auth/confirm',
  CARE_CONTEXTS_ADD: ADAPTER_URL + '/v0.5/links/link/add-contexts',
  CARE_CONTEXTS_NOTIFY: ADAPTER_URL + '/v0.5/patients/sms/notify2',
  CONSENT_REQUEST_INIT: ADAPTER_URL + '/v0.5/consent-requests/init',
  CM_REQUEST: ADAPTER_URL + '/v0.5/health-information/cm/request',
  CONSENT_FETCH: ADAPTER_URL + '/v0.5/consents/fetch',
  ON_NOTIFY_HIP: ADAPTER_URL + '/v0.5/consents/hip/on-notify',
  ON_NOTIFY_HIU: ADAPTER_URL + '/v0.5/consents/hiu/on-notify',
};

const SERVER = { SERVER_ID: '0' };
const generateServerId = () => {
  const num = Math.floor(Math.random() * 30) + 1;

  SERVER.SERVER_ID = num < 10 ? '0' + num : num.toString();
};
const getServerId = () => {
  return SERVER.SERVER_ID;
};
const HEALTH_RECORD_SERVICE_URL = process.env.HEALTH_RECORD_SERVICE_URL || 'http://health-record-service:8004';

const KAFKA_GRP = {
  status: false,
};

export { KAFKA_GRP, HEALTH_URL, cmId, getServerId, generateServerId, HEALTH_RECORD_SERVICE_URL };
