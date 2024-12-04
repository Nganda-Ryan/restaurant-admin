export async function handleResponse<T>(response: Response): Promise<{ jsonResponse: T; httpStatusCode: number }> {
    if (!response.ok) {
        console.log(response.json())
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    try {
        const jsonResponse = await response.json();
        return { jsonResponse, httpStatusCode: response.status };
    } catch (err: unknown) {
        const errorMessage = (err as Error).message;
        throw new Error(`Error parsing response: ${errorMessage}`);
    }
}

export function isExpiry(dateString: string | null | undefined): boolean {
    if (!dateString) {
        console.warn("La date fournie est null ou undefined.");
        return false; // Par défaut, considérer qu'il n'est pas expiré si aucun paramètre n'est fourni
    }

    const inputDate = new Date(dateString);
    const currentDate = new Date();

    if (isNaN(inputDate.getTime())) {
        console.error("La date fournie n'est pas valide.");
        return false;
    }

    return inputDate < currentDate;
}
