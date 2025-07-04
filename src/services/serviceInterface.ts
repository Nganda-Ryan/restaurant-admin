
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
    "RestaurantCode"?: string,
    "ProductCode"?: string,
    "PlatCode"?: string,
    "Body"?: string,
    "DisplayOrder"?: number,
    "TypeCode"?: string,
    "Id"?:number,
    "Title"?: string,
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
    ThresholdQuantity: number;
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
    "inputField"?:string
    "Id"?: number; 
}
export interface Table {
    Code?: string,
    Title?: string;
    Description?: string;
    IsActive?: boolean;
}
export interface Team{
    external_id?: string,
    first_name?: string,
    last_name?: string,
    phone_number?: string,
    restaurantCode?: string,
    email?: string,
    password?: string,
    roleCode?: string,
    adress?: string,

}

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | string;
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

export interface User {
  Code: string;
  Email: string;
  FirstName: string;
  LastName: string;
  PhoneNumber: string;
  Status: string;
}

export interface Profile {
  id: number;
  RestaurantCode: string;
  RoleCode: string;
  Status: string;
  UserCode: string;
}

export interface AuthState {
  user: User | null;
  profiles: Profile[];
}