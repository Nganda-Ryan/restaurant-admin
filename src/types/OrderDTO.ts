import type DisheDTO  from '@/types/DisheDTO';

export default interface OrderDTO {
    orderCode: string | null,
    dishes:  OrderDTODish[],
    totalPrice: number,
    tableID: number,
    state: "EDITING" | "IN KITCHEN" | "COMPLETED"
}

export interface OrderDTODish {
    dishe: DisheDTO
    totalNumber: number
}