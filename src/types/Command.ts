export default interface Command {
    code: string;
    description: string;
    statusCode: string;
    createdDate?: Date;
    updatedOn?: Date;
}