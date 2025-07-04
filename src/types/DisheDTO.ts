import { SimpleCardType } from "./SimpleCardType";

export default interface DisheDTO {
    code: string
    image: string
    title: string
    price: number
    type: SimpleCardType
    quantity: number
    desctiption: string
    categoryCode: string
    currency: string
    CreatedDate?: string
    UpdatedOn?: string
}

/*
Code VARCHAR(60) PRIMARY KEY,
    Title VARCHAR(255) NOT NULL,
    Desctiption VARCHAR(255) NOT NULL, 
    CategoryCode VARCHAR(45) NOT NULL,

    Likes INT DEFAULT 0,

	BasePrice DECIMAL(10,2) NOT NULL DEFAULT 0,
    Currency VARCHAR(3) NOT NULL DEFAULT 'EUR',

    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP, 
    UpdatedOn DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CategoryCode)  REFERENCES PlatCategory(Code)
*/