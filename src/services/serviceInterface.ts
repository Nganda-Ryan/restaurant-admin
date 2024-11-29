export interface MenuRequest {
    Code: string | undefined,
    Title: string | undefined,
    Description: string | undefined,
    StartDate: string | undefined,
    EndDate: string | undefined,
}

export interface PlateInfo {
    "Code": string,
    "Title": string,
    "Description": string,
    "BasePrice": number,
    "Currency": string,
    "CategoryCode": string,
    "Likes": number,
    "content": any []
}

export interface MenuItem {
    PlateCode?: string,
    QuantityAvailable?: string,
}

export interface Plat {
    Code: string,
    Title: string,
    BasePrice: number,
    Currency: string,
    CategoryCode: string,
    Likes: number,
    content: []
}

export interface Content {
    "ProductCode"?: string,
    "PlatCode"?: string,
    "Body"?: string,
    "DisplayOrder"?: number,
    "TypeCode"?: string
}

export interface PlateContent {
    "PlatCode"?: string,
    "Body"?: string,
    "DisplayOrder"?: number,
    "TypeCode"?: string
}

export interface Product {
    "Code"?: string,
    "Title"?: string,
    "Description"?: string,
    "QuantityUnitCode"?: string,
    "AvailableQuantity"?: number,
    "image"?: string,
    "CategoryCode"?: string,
    "Likes"?: number,
    "Image"?: any
}

// export interface Content {
//     "Code": string,
//     "Title": string,
//     "isActive": number
// }

export interface Plate {
    "Code"?: string,
    "Title"?: string,
    "Description"?: string,
    "Currency"?: string,
    "CategoryCode"?: string
    "BasePrice"?: number,
}

export interface PlateOption {
    "Code"?: string,
    "Title"?: string,
    "Description"?: string,
    "Currency"?: string,
    "CategoryCode"?: string
    "BasePrice"?: number,
    "Image"?: any,
}

export interface PlateOption {
    "Code"?: string,
    "Title"?: string,
    "Description"?: string,
    "Currency"?: string,
    "CategoryCode"?: string
    "BasePrice"?: number,
    "Image"?: any,
}

export interface Compositions {
    "ProductCode"?: string,
    "PlateCode": string
}

export interface ProductOption {
    "name"?: string,
    "api": string,
    "quantity": number
}

export interface FormattedDates {
    startDate: string;
    endDate: string;
}