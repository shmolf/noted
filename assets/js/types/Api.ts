export interface DateTime {
    date: string,
    timezone: string,
    timezone_type: number,
}

export interface AjaxErrorRepsonse {
    type: string,
    title: string,
    errors: string[],
}
