import axios from "axios";
import type { PlateOption, Content, PlateContent, Compositions, composition, Categorieplat } from "./serviceInterface";
import { createPinia } from "pinia";

import { useAuthStore } from '@/stores/auth';

const pinia = createPinia();

/* MENU */
export const fetchMenu = async () => {
    const url =  `${import.meta.env.VITE_APP_MENU_BASE_URL_V1}/menus`;
    try {
        const response = await axios (url, {
            params: {
                all: true
            },
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            method: "GET",
        });
        return response.data.body.results;
    } catch (error) {
        console.error('Database.fetchMenu.error ::', error);
        throw error;
    }
};
export const fetchSingleMenu = async (menuCode: string) => {
    const url =  `${import.meta.env.VITE_APP_MENU_BASE_URL_V1}/menus/items?MenuCode=${menuCode}`;
    try {
        const response = await axios (url, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            method: "GET",
        });
        return response.data.body.results;
    } catch (error) {
        console.error('Database.fetchMenu.error ::', error);
        throw error;
    }
};
export const createMenu = async (payload: any) => {
    const url =  `${import.meta.env.VITE_APP_MENU_BASE_URL_V1}/menus`;

    try {
        const response = await axios.post(url, { 
            Menu: payload
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.data.body;
    } catch (error) {
        console.error('Database.createMenu.error ::', error);
        throw error;
    }
};
export const cloneMenu = async (payload: any, parentCode: string|undefined) => {
    const url =  `${import.meta.env.VITE_APP_MENU_BASE_URL_V1}/menus/clone?MenuCode=${parentCode}&DeepClone=true`;
    try {
        const response = await axios.post(url, { 
            Menu: payload
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.data.body;
    } catch (error) {
        console.error('Database.createMenu.error ::', error);
        throw error;
    }
};
export const updateMenu = async (payload: any) => {
    const url =  `${import.meta.env.VITE_APP_MENU_BASE_URL_V1}/menus`;

    try {
        const response = await axios.put(url, { 
            Menu: payload
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.data.body;
    } catch (error) {
        console.error('Database.updateMenu.error ::', error);
        throw error;
    }
};
export const updateMenuItem = async (payload: any) => {
    const url =  `${import.meta.env.VITE_APP_MENU_BASE_URL_V1}/menus/items`;

    try {
        const response = await axios.put(url, { 
            Items: payload
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.data.body;
    } catch (error) {
        console.error('Database.updateMenuItems.error ::', error);
        throw error;
    }
};

export const addMenuItem = async (payload: any) => {
    const url =  `${import.meta.env.VITE_APP_MENU_BASE_URL_V1}/menus/items`;  
    try {   
        const responce = await axios.post(url, {
            Items: payload
        }, {    
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return responce.data.body;
    } catch (error) {
        console.error('Database.addMenuItems.error ::', error);
        throw error;
    }
}
export const deleteMenu = async (codeList: any[]) => {
    const url =  `${import.meta.env.VITE_APP_MENU_BASE_URL_V1}/menus`;
    try {
        const response = await axios.delete(url,{
            data: { 
                Menus: codeList
            },
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.data.body;
    } catch (error) {
        console.error('Database.createMenu.error ::', error);
        throw error;
    }
}
export const deleteMenuItem = async (codeList: any[]) => {
    const url =  `${import.meta.env.VITE_APP_MENU_BASE_URL_V1}/menus/items`;
    try {
        const response = await axios.delete(url,{
            data: { 
                Items: codeList
            },
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.data.body;
    } catch (error) {
        console.error('Database.deleteMenuItem.error ::', error);
        throw error;
    }
}




/* PLATE */
export const fetchPlate = async () => {
    const url =  `${import.meta.env.VITE_APP_PLAT_BASE_URL_V1}/plats`;

    try {
        const response = await axios (url, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            method: "GET",
        });
        return response.data.body.results;
    } catch (error) {
        console.error('Database.fetchPlate.error ::', error);
        throw error;
    }
}
export const createPlate = async (payload: PlateOption) => {
    const url =  `${import.meta.env.VITE_APP_PLAT_BASE_URL_V1}/plats`;

    try {
        const response = await axios.post(url, { 
            plats: [payload]
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.data.body;
    } catch (error) {
        console.error('Database.createPlate.error ::', error);
        throw error;
    }
}
export const deletePlate = async (codeList: any[]) => {
    const url =  `${import.meta.env.VITE_APP_PLAT_BASE_URL_V1}/plats`;
    try {
        const response = await axios.delete(url,{
            data: { 
                plats:codeList
            },
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.data.body;
    } catch (error) {
        console.error('Database.deletePlate.error ::', error);
        throw error;
    }
}

export const updatePlate = async (payload: PlateOption) => {
    const url =  `${import.meta.env.VITE_APP_PLAT_BASE_URL_V1}/plats`;
    try {
        const response = await axios.put(url, { 
            plat: payload
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.data.body;
    } catch (error) {
        console.error('Database.updatePlate.error ::', error);
        throw error;
    }
}
export const createConsistency = async (payload: Compositions[]) => {
    const url =  `${import.meta.env.VITE_APP_CONSISTENCY_BASE_URL_V1}/compositions`;
    console.log('Database.createConsistency.createPlate.payload', payload)
    try {
        const response = await axios.post(url, { 
            Compositions: payload
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.data.body;
    } catch (error) {
        console.error('Database.createConsistency.createPlate.error ::', error);
        throw error;
    }
}
export const UpdateConsistency = async (payload: composition) => {
    const url =  `${import.meta.env.VITE_APP_CONSISTENCY_BASE_URL_V1}/compositions`;
    console.log('Database.createConsistency.createPlate.payload', payload)
    try {
        const response = await axios.put(url, { 
            Composition: payload
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.data.body;
    } catch (error) {
        console.error('Database.UpdateConsistency.createPlate.error ::', error);
        throw error;
    }
}
export const getConsistency = async  (plateCode: string): Promise<{body: { results: any[] } }>  => {
    const url = `${import.meta.env.VITE_APP_CONSISTENCY_BASE_URL_V1}/compositions?PlateCode=${plateCode}`;

    try {
        const response = await axios(url, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            method: "GET",
        });
        return response.data;
    } catch (error) {
        console.error('Database.fetchOrder.error ::', error);
        throw error;
    }
}


/* ORDER */

    export const fetchOrder = async () => {
        const url =  `${import.meta.env.VITE_APP_ORDER_BASE_URL_V1}/orders`;

        try {
            const response = await axios (url, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                method: "GET",
            });
            return response.data.body.results;
        } catch (error) {
            console.error('Database.fetchOrder.error ::', error);
            throw error;
        }
    }
    export const fetchSingleOrder = async (orderCode:string) => {
        const url =  `${import.meta.env.VITE_APP_ORDER_BASE_URL_V1}/orders/items?OrderCode=${orderCode}`;

        try {
            const response = await axios (url, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                method: "GET",
            });
            return response.data.body.results;
        } catch (error) {
            console.error('Database.fetchSingleOrder.error ::', error);
            throw error;
        }
    }
    export const updateOrder = async (payload: any) => {
        const url =  `${import.meta.env.VITE_APP_ORDER_BASE_URL_V1}/orders`;
        try {
            const response = await axios.put(url, { 
                Order: payload
            }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            return response.data.body;
        } catch (error) {
            console.error('Database.updateMenu.error ::', error);
            throw error;
        }
    }
    export const deleteOrder = async (codeList: any[]) => {
        const url = `${import.meta.env.VITE_APP_ORDER_BASE_URL_V1}/orders`;
        try {
            const response = await axios.delete(url, {
                data: { 
                    Orders: codeList
                },
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            return response.data.body;
        } catch (error) {
            console.error('Database.deleteOrder.error ::', error);
            throw error;
        }
    }


/* PRODUCT */
export const fetchProduct = async () => {
    const url =  `${import.meta.env.VITE_APP_PRODUCT_BASE_URL_V1}/products`;

    try {
        const response = await axios (url, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            method: "GET",
        });
        return response.data.body.results;
    } catch (error) {
        console.error('Database.fetchProduct.error ::', error);
        throw error;
    }
}
export const fetchSingleProduct = async (productCode:string) => {
    const url =  `${import.meta.env.VITE_APP_PRODUCT_BASE_URL_V1}/products?ProductCode=${productCode}`;
    

    try {
        const response = await axios (url, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            method: "GET",
        });
        return response.data.body.results;
    } catch (error) {
        console.error('Database.fetchProduct.error ::', error);
        throw error;
    }
}
export const createProduct = async (payload: any) => {
    const url =  `${import.meta.env.VITE_APP_PRODUCT_BASE_URL_V1}/products`;

    try {
        const response = await axios.post(url, { 
            products: [payload]
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.data.body;
    } catch (error) {
        console.error('Database.createProduct.error ::', error);
        throw error;
    }
};
export const updateProduct = async (payload: any) => {
    const url =  `${import.meta.env.VITE_APP_PRODUCT_BASE_URL_V1}/products`;
    try {
        const response = await axios.put(url, { 
            product: payload
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.data.body;
    } catch (error) {
        console.error('Database.updateProduct.error ::', error);
        throw error;
    }
};

/* CONTENT */
    /* Product */
export const createContent = async (payload: Content[] | PlateContent[]) => {
    const url =  `${import.meta.env.VITE_APP_CONFIG_BASE_URL_V1}/contents`;
    console.log('Database.createConsistency.createContent.payload', payload)
    try {
        const response = await axios.post(url, { 
            Contents: payload
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        console.error('database.createContent', response.data.body)
        return response.data;
    } catch (error) {
        console.error('Database.Content.createContent.error ::', error);
        throw error;
    }
    
}
export const updateContent = async (payload: Content [] | PlateContent[]) => {
    const url =  `${import.meta.env.VITE_APP_CONFIG_BASE_URL_V1}/contents`;
    console.log('Database.createConsistency.createContent.payload', payload)
    try {
        const response = await axios.put(url, { 
            Content: payload
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        console.error('database.createContent', response.data.body)
        return response.data;
    } catch (error) {
        console.error('Database.Content.updateContent.error ::', error);
        throw error;
    }
    
}
export const fetchContent = async (plateCode:String) => {
    const url =  `${import.meta.env.VITE_APP_CONFIG_BASE_URL_V1}/contents?PlateCode=${plateCode}`;
    try {
        const response = await axios (url, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            method: "GET",
        });
        console.error('database.fetchContent', response.data.body)
        return response.data;
    } catch (error) {
        console.error('Database.Content.fetchContent.error ::', error);
        throw error;
    }
    
}

export const uploadContent = async (file: File) => {
    const cloudName = import.meta.env.VITE_APP_CLOUD_NAME; // Remplacez par votre Cloud Name
    const uploadPreset = import.meta.env.VITE_APP_UPLOAD_PRESET_KEY


    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset); // On passe le preset ici

    try {
        // Envoyer la requête POST vers Cloudinary
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            formData
        );
        
        return response.data.secure_url;
    } catch (error) {
        console.error('Erreur lors de l\'upload :', error);
        console.error('Échec de l\'upload de l\'image.');
    }
}

/* CONFIG */
export const fetchConfig = async () => {
    const url =  `${import.meta.env.VITE_APP_CONFIG_BASE_URL_V1}/configs?categories=true&QuantityUnit=true`;

    try {
        const response = await axios (url, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            method: "GET",
        });
        return response.data.body;
    } catch (error) {
        console.error('Database.fetchConfig.error ::', error);
        throw error;
    }
}

/* CATEGORIE PLATE */

export const fetchCategoriePlate = async () => {
    const url =  `${import.meta.env.VITE_APP_CATEGORIE_BASE_URL_V1}/plat-categories`;
    try {
        const response = await axios (url, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            method: "GET",
        });
        return response.data.body.results
    } catch (error) {
        console.error('Database.fetchProduct.error ::', error);
        throw error;
    }
}
export const createCategoriePlate = async (payload:Categorieplat) => {
    const url =  `${import.meta.env.VITE_APP_CATEGORIE_BASE_URL_V1}/plat-categories`;
    console.log('Database.createConsistency.createContent.payload', payload)
    try {
        const response = await axios.post(url, { 
            PlatCategory: payload
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        console.error('database.createContent', response.data.body)
        return response.data;
    } catch (error) {
        console.error('Database.Content.createContent.error ::', error);
        throw error;
    }
    
}
export const updateCategoriePlat = async (payload:Categorieplat) => {
    const url =  `${import.meta.env.VITE_APP_CATEGORIE_BASE_URL_V1}/plat-categories`;
    console.log('Database.createConsistency.createContent.payload', payload)
    try {
        const response = await axios.put(url, { 
            PlatCategory: payload
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        console.error('database.createContent', response.data.body)
        return response.data;
    } catch (error) {
        console.error('Database.Content.updateContent.error ::', error);
        throw error;
    }
    
}
export const deleteCategoriePlat = async (Code: any[]) => {
    const url =  `${import.meta.env.VITE_APP_CATEGORIE_BASE_URL_V1}/plat-categories`;
    try {
        const response = await axios.delete(url,{
            data: { 
                PlatCategories: Code
            },
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.data.body;
    } catch (error) {
        console.error('Database.createMenu.error ::', error);
        throw error;
    }
}

//dashboard

export const fetchPopularplate = async () => {
    const url =  `${import.meta.env.VITE_APP_DASHBOARD_BASE_URL_V1}/popular-plats`;
    try {
        const response = await axios (url, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            method: "GET",
        });
        return response.data.body
    } catch (error) {
        console.error('Database.popularplate.error ::', error);
        throw error;
    }
}

export const fetchDayCommande = async () => {
    const url =  `${import.meta.env.VITE_APP_DASHBOARD_BASE_URL_V1}/orders`;
    try {
        const response = await axios (url, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            method: "GET",
        });
        return response.data.body
    } catch (error) {
        console.error('Database.oders.error ::', error);
        throw error;
    }
}
export const fetchTotalMenu = async () => {
    const url =  `${import.meta.env.VITE_APP_DASHBOARD_BASE_URL_V1}/menus`;
    try {
        const response = await axios (url, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            method: "GET",
        });
        return response.data.body
    } catch (error) {
        console.error('Database.totalMenu.error ::', error);
        throw error;
    }
}
export const fetchRecentOrder = async () => {
    const url =  `${import.meta.env.VITE_APP_DASHBOARD_BASE_URL_V1}/recent-orders`;
    try {
        const response = await axios (url, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            method: "GET",
        });
        return response.data.body.results
    } catch (error) {
        console.error('Database.popularplate.error ::', error);
        throw error;
    }
}

//generate code function

export const generateCode = (title:string) => {
    let result = '';

    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * title.length);
        result += title[randomIndex];
    }

    return result;
}

export const formatedDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Les mois sont de 0 à 11
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}





