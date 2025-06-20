
export interface MenuRequest {
    Code: string | undefined,
    Title: string | undefined,
    Description: string | undefined,
    StartDate: string | undefined,
    EndDate: string | undefined,
    RestaurantCode: string | undefined,
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
    "TypeCode"?: string,
    "Id"?:number
}

export interface PlateContent {
    "PlatCode"?: string,
    "Body"?: string,
    "DisplayOrder"?: number,
    "TypeCode"?: string
}
 export interface AuthResponse {

}

export interface Product {
    Code: string;
    Title: string;
    CategoryCode: string;
    Description: string;
    Likes: number;
    AvailableQuantity: number;
    QuantityUnitCode: string;
    RestaurantCode: string;
    Image: File | null; // Image peut être un fichier ou null
}

export interface user {
    "Id": number,
}
export interface Composition {
    Id: number,
    AsIngredient: number,
    QuantityOfConsumption: number,
    IsOptional: number,
    ProductCode: string,
    PlateCode: string,
    Product: Product; // Détails du produit
}
export interface ResultItem {
    Code: string;
    Title: string;
    BasePrice: number;
    Currency: string;
    CategoryCode: string;
    Likes: number;
    composition: Composition[]; // `items` est ici appelé `composition`
}
export interface ApiResponse {
    body: {
        results: ResultItem[];
    };
}
export interface Categorieplat {
    "Code"?: string,
    "Title"?: string,
    "IsActive"?: boolean,
    "RestaurantCode"?: string 
}

export interface Stocks {
    "code"?: string,
    "quantity"?: number
}

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
    "RestaurantCode": string,
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
    "PlateCode": string,
    "QuantityOfConsumption": number;
}
export interface composition{
    "Id": number,
    "ProductCode": string,
    "PlateCode": string,
    "QuantityOfConsumption": number;
}
export interface ProductOption {
    "name"?: string,
    "api": string,
    "quantity": number,
    "inputField"?:String
    "Id"?: number; 
}
export interface Table {
    Code?: string,
    Title: string;
    Description: string;
}
export interface FormattedDates {
    startDate: string;
    endDate: string;
}

export interface NutritionalOption {
    name: string;
    api: string;
    unit: string;
}

// interfaces/user.interfaces.ts

export interface IUserProfile {
  id: number;
  RestaurantCode: string;
  RoleCode: string;
  Status: string;
  UserCode: string;
}

export interface IUser {
  Code: string;
  CreatedAt: string;
  Email: string;
  ExternalId: string;
  FirstName: string;
  LastName: string;
  PhoneNumber: string;
  Status: string;
  UpdatedAt: string;
}

export interface IAuthResponse {
  user: IUser;
  profiles: IUserProfile[];
}