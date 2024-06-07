
export type CodeSystemsApiResponse = {
    items: CodeSystem[]
}

export type CodeSystem = {
    "codeSystemName": string;
    "title": string;
    "versions": CodeSystemVersion[]
}

export type CodeSystemVersion = {
    "versionName": string,
    "status": string,
    "publishedDate": Date;
    "effectiveDate": Date;
    "availableDate": Date;
    "codes": CodeSystemCode[]
}

export type CodeSystemCode = {
    "code": number,
    "name": string
    "status": string
    "termType": string
    "isActive": string
}

