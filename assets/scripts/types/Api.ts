export interface DateTime {
    date: string,
    timezone: string,
    // eslint-disable-next-line camelcase
    timezone_type: number,
}

export interface AjaxErrorRepsonse {
    type: string,
    title: string,
    errors: string[],
}

export interface TokenSourcePayload {
  accessToken: { token: string, expiration: string, uri: string },
  refreshToken: { token: string, expiration: string, uri: string },
}
