import axios from 'axios';
import { cmId, HEALTH_URL } from '../config';

enum facilityType {
  'HIP',
  'HIU',
}

export const authModes = async (
  requestId: string,
  id: string,
  facilityId: string,
  type: facilityType
): Promise<any> => {
  const { data } = await axios.post(
    HEALTH_URL.AUTH_FETCH_MODES,
    {
      requestId,
      timestamp: new Date(Date.now()).toISOString(),
      query: {
        id,
        purpose: 'KYC_AND_LINK',
        requester: {
          type,
          id: facilityId,
        },
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-CM-ID': cmId,
      },
    }
  );

  return data;
};

export const initateAuth = async (
  requestId: string,
  id: string,
  authMode: string,
  facilityId: string,
  type: facilityType,
  purpose: string
): Promise<any> => {
  const { data } = await axios.post(
    HEALTH_URL.AUTH_INIT,
    {
      requestId,
      timestamp: new Date(Date.now()).toISOString(),
      query: {
        id,
        purpose,
        authMode,
        requester: {
          type,
          id: facilityId,
        },
      },
    },
    {
      headers: {
        'X-CM-ID': cmId,
      },
    }
  );

  return data;
};

export const verifyAuth = async (
  requestId: string,
  transactionId: string,
  authCode: string,
  authMode: string,
  demographics: Record<string, any>
): Promise<any> => {
  const body = {
    requestId,
    timestamp: new Date(Date.now()).toISOString(),
    transactionId,
    credential: {} as any,
  };
  if (authMode === 'DEMOGRAPHICS') {
    body.credential.demographic = {
      name: demographics.name,
      dateOfBirth: demographics.dob,
      gender: demographics.gender[0].toString().toUpperCase(),
      identifier: {
        type: demographics.identifier,
        value: demographics.identifierValue,
      },
    };
  } else {
    body.credential = {
      authCode,
    };
  }

  const { data, status } = await axios.post(HEALTH_URL.AUTH_CONFIRM, body, {
    headers: {
      'X-CM-ID': cmId,
    },
  });

  return data;
};
