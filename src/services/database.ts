import axios from "axios";
import type { PlateOption, Content, PlateContent, Compositions, composition, Categorieplat, Stocks, Table, Team } from "./serviceInterface";
import { createPinia } from "pinia";
import { Client, Account} from 'appwrite'
import { useAuthStore } from '@/stores/auth';

const pinia = createPinia();

const token = localStorage.getItem('jwt') || '';
const restaurantCode = localStorage.getItem('restaurantCode')

/* AUTHENTIFICATION*/

const client = new Client()
    .setEndpoint(`${import.meta.env.VITE_APP_AUTHENTIFICATION_BASE_URL_V1}`) // Votre endpoint Appwrite
    .setProject(`${import.meta.env.VITE_APP_NAME_PROJECT}`); // Votre project ID
export const account = new Account(client);


/* get-user authentificaion */

export const getUser= async (_token: string) => {
    console.log("--> getUser")
    const url = `${import.meta.env.VITE_APP_GET_USER_BASE_URL_V1}/get-user`;
    const authStore = useAuthStore();
    try {
        const response = await axios (url, {
            params: {
                all: true
            },
            headers: {
                //"API_KEY":`${token}`
                "API_KEY": _token // Format spécifique visible dans Postman
            },
            method: "GET",
        });
        console.log('response.data', response)
        return response.data.body;


    } catch (error) {
        console.error('Database.getuser.error ::', error);
        throw error;
    }
};


/* MENU */
export const fetchMenu = async (_token:string) => {
    const url =  `${import.meta.env.VITE_APP_MENU_BASE_URL_V1}/menus?RestaurantCode=${restaurantCode}`;
    const authStore = useAuthStore()
    console.log('fetchMenu', url)
    console.log('_token', _token) 
    try {
        const response = await axios (url, {
            params: {
                all: true
            },
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "API_KEY": _token
            },
            method: "GET",
        });
        return response.data.body.results;
    } catch (error) {
        console.error('Database.fetchMenu.error ::', error);
        throw error;
    }
};
export const fetchSingleMenu = async (menuCode: string, _token:string) => {
    console.log('fetchSingleMenu', menuCode)
    const url =  `${import.meta.env.VITE_APP_MENU_BASE_URL_V1}/menus/items?MenuCode=${menuCode}&RestaurantCode=${restaurantCode}`;
    const authStore = useAuthStore()
    try {
        const response = await axios (url, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "API_KEY":_token
            },
            method: "GET",
        });
        return response.data.body.results;
    } catch (error) {
        console.error('Database.fetchMenu.error ::', error);
        throw error;
    }
};
export const createMenu = async (payload: any , _token: string) => {
    const url =  `${import.meta.env.VITE_APP_MENU_BASE_URL_V1}/menus`;
    const authStore = useAuthStore()
    try {
        const response = await axios.post(url, { 
            Menu: payload
        }, {
            headers: {
                'Content-Type': 'application/json',
                "API_KEY": _token
            }
        });
        return response.data.body;
    } catch (error) {
        console.error('Database.createMenu.error ::', error);
        throw error;
    }
};
export const cloneMenu = async (payload: any, parentCode: string|undefined, _token:string) => {
    const url =  `${import.meta.env.VITE_APP_MENU_BASE_URL_V1}/menus/clone?MenuCode=${parentCode}&DeepClone=true`;
    const authStore = useAuthStore()
    try {
        const response = await axios.post(url, { 
            Menu: payload
        }, {
            headers: {
                'Content-Type': 'application/json',
                "API_KEY": _token
            }
        });
        return response.data.body;
    } catch (error) {
        console.error('Database.createMenu.error ::', error);
        throw error;
    }
};
export const updateMenu = async (payload: any, _token:string) => {
    const url =  `${import.meta.env.VITE_APP_MENU_BASE_URL_V1}/menus`;
    const authStore = useAuthStore()
    try {
        const response = await axios.put(url, { 
            Menu: payload
        }, {
            headers: {
                'Content-Type': 'application/json',
                "API_KEY": _token
            }
        });
        return response.data.body;
    } catch (error) {
        console.error('Database.updateMenu.error ::', error);
        throw error;
    }
};
export const updateMenuItem = async (payload: any, _token:string) => {
    const url =  `${import.meta.env.VITE_APP_MENU_BASE_URL_V1}/menus/items`;
        
    const authStore = useAuthStore()
    console.log('Database.updateMenuItems.payload', payload)
    try {
        const response = await axios.put(url, { 
            Items: payload
        }, {
            headers: {
                'Content-Type': 'application/json',
                "API_KEY": _token
            }
        });
        return response.data.body;
    } catch (error) {
        console.error('Database.updateMenuItems.error ::', error);
        throw error;
    }
};

export const addMenuItem = async (payload: any, _token:string) => {
    const url =  `${import.meta.env.VITE_APP_MENU_BASE_URL_V1}/menus/items`;  
    const authStore = useAuthStore()
    try {   
        const responce = await axios.post(url, {
            Items: payload
        }, {    
            headers: {
                'Content-Type': 'application/json',
                "API_KEY": _token
            }
        });
        return responce.data.body;
    } catch (error) {
        console.error('Database.addMenuItems.error ::', error);
        throw error;
    }
}
export const deleteMenu = async (codeList: any[], _token:string) => {
    const url = `${import.meta.env.VITE_APP_MENU_BASE_URL_V1}/menus?RestaurantCode=${restaurantCode}`;
    const authStore = useAuthStore()
    console.log('Database.deleteMenu.codeList', codeList)
    try {
        const response = await axios.delete(url,{
            data: { 
                Menus: codeList
            },
            headers: {
                'Content-Type': 'application/json',
                "API_KEY": _token
            }
        });
        return response.data.body;
    } catch (error) {
        console.error('Database.createMenu.error ::', error);
        throw error;
    }
}
export const deleteMenuItem = async (codeList: any[], _token:string) => {
    const url =  `${import.meta.env.VITE_APP_MENU_BASE_URL_V1}/menus/items`;
    const authStore = useAuthStore()
    try {
        const response = await axios.delete(url,{
            data: { 
                Items: codeList
            },
            headers: {
                'Content-Type': 'application/json',
                "API_KEY": _token
            }
        });
        return response.data.body;
    } catch (error) {
        console.error('Database.deleteMenuItem.error ::', error);
        throw error;
    }
}

/* PLATE */
export const fetchPlate = async (_token:string) => {
    const url =  `${import.meta.env.VITE_APP_PLAT_BASE_URL_V1}/plats?RestaurantCode=${restaurantCode}`;
    console.log('url', url)
    const authStore = useAuthStore()
    try {
        const response = await axios (url, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "API_KEY": _token
            },
            method: "GET",
        });
        return response.data.body.results;
    } catch (error) {
        console.error('Database.fetchPlate.error ::', error);
        throw error;
    }
}
export const createPlate = async (payload: PlateOption, _token:string) => {
    const url =  `${import.meta.env.VITE_APP_PLAT_BASE_URL_V1}/plats`;
    const authStore = useAuthStore()
    try {
        const response = await axios.post(url, { 
            plats: [payload]
        }, {
            headers: {
                'Content-Type': 'application/json',
                "API_KEY": _token
            }
        });
        return response.data.body;
    } catch (error) {
        console.error('Database.createPlate.error ::', error);
        throw error;
    }
}
export const deletePlate = async (codeList: any[], _token:string) => {
    const url =  `${import.meta.env.VITE_APP_PLAT_BASE_URL_V1}/plats`;
    const authStore = useAuthStore()
    try {
        const response = await axios.delete(url,{
            data: { 
                plats:codeList
            },
            headers: {
                'Content-Type': 'application/json',
                "API_KEY": _token
            }
        });
        return response.data.body;
    } catch (error) {
        console.error('Database.deletePlate.error ::', error);
        throw error;
    }
}

export const updatePlate = async (payload: PlateOption, _token:string) => {
    const url =  `${import.meta.env.VITE_APP_PLAT_BASE_URL_V1}/plats`;
    const authStore = useAuthStore()
    try {
        const response = await axios.put(url, { 
            plat: payload
        }, {
            headers: {
                'Content-Type': 'application/json',
                "API_KEY": _token
            }
        });
        return response.data.body;
    } catch (error) {
        console.error('Database.updatePlate.error ::', error);
        throw error;
    }
}
export const createConsistency = async (payload: Compositions[], _token:string) => {
    const url = `${import.meta.env.VITE_APP_CONSISTENCY_BASE_URL_V1}/compositions`;
    const authStore = useAuthStore()
    
    console.log('Database.createConsistency.createPlate.payload', payload)
    try {
        const response = await axios.post(url, { 
            Compositions: payload
        }, {
            headers: {
                'Content-Type': 'application/json',
                "API_KEY": _token
            }
        });
        return response.data.body;
    } catch (error) {
        console.error('Database.createConsistency.createPlate.error ::', error);
        throw error;
    }
}
export const UpdateConsistency = async (payload: composition, _token:string) => {
    const url =  `${import.meta.env.VITE_APP_CONSISTENCY_BASE_URL_V1}/compositions`;
    const authStore = useAuthStore()
    console.log('Database.createConsistency.createPlate.payload', payload)
    try {
        const response = await axios.put(url, { 
            Composition: payload
        }, {
            headers: {
                'Content-Type': 'application/json',
                "API_KEY": _token
            }
        });
        return response.data.body;
    } catch (error) {
        console.error('Database.UpdateConsistency.createPlate.error ::', error);
        throw error;
    }
}
export const getConsistency = async  (plateCode: string, _token:string): Promise<{body: { results: any[] } }>  => {
    const url = `${import.meta.env.VITE_APP_CONSISTENCY_BASE_URL_V1}/compositions?PlateCode=${plateCode}`;
    console.log('codeplate', plateCode)
    const authStore = useAuthStore()
    try {
        const response = await axios(url, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "API_KEY": _token
            },
            method: "GET",
        });
        return response.data;
    } catch (error) {
        console.error('Database.fetcconsistency.error ::', error);
        throw error;
    }
}

/* ORDER */

export const fetchOrder = async (_token:string) => {
    const url =  `${import.meta.env.VITE_APP_ORDER_BASE_URL_V1}/orders?RestaurantCode=${restaurantCode}`;
    const authStore = useAuthStore()
    try {
        const response = await axios (url, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "API_KEY": _token
            },
            method: "GET",
        });
        return response.data.body.results;
    } catch (error) {
        console.error('Database.fetchOrder.error ::', error);
        throw error;
    }
}
export const fetchSingleOrder = async (orderCode:string, _token:string) => {
    const url =  `${import.meta.env.VITE_APP_ORDER_BASE_URL_V1}/orders/items?OrderCode=${orderCode}&RestaurantCode=${restaurantCode}`;
    const authStore = useAuthStore()
    try {
        const response = await axios (url, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "API_KEY": _token
            },
            method: "GET",
        });
        return response.data.body.results;
    } catch (error) {
        console.error('Database.fetchSingleOrder.error ::', error);
        throw error;
    }
}
export const updateOrder = async (payload: any, _token:string) => {
    const authStore = useAuthStore();
    const url =  `${import.meta.env.VITE_APP_ORDER_BASE_URL_V1}/orders?RestaurantCode=${restaurantCode}`;
    try {
        const response = await axios.put(url, { 
            Order: payload
        }, {
            headers: {
                'Content-Type': 'application/json',
                "API_KEY": _token
            }
        });
        await authStore.wsconnect(payload.OrderCode,JSON.stringify(payload));
        //await authStore.wssendMessage(JSON.stringify({ event: 'update', orderCode: payload.OrderCode }));
        return response.data.body;
    } catch (error) {
        console.error('Database.updateMenu.error ::', error);
        throw error;
    }
}
export const deleteOrder = async (codeList: any[], _token:string) => {
    const url = `${import.meta.env.VITE_APP_ORDER_BASE_URL_V1}/orders`;
    const authStore = useAuthStore()
    try {
        const response = await axios.delete(url, {
            data: { 
                Orders: codeList
            },
            headers: {
                'Content-Type': 'application/json',
                "API_KEY": _token
            }
        });
        return response.data.body;
    } catch (error) {
        console.error('Database.deleteOrder.error ::', error);
        throw error;
    }
}


/* PRODUCT */
export const fetchProduct = async (_token:string ) => {
    const url =  `${import.meta.env.VITE_APP_PRODUCT_BASE_URL_V1}/products?RestaurantCode=${restaurantCode}`;
    const authStore = useAuthStore()
    try {
        const response = await axios (url, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "API_KEY": _token
            },
            method: "GET",
        });
        return response.data.body.results;
    } catch (error) {
        console.error('Database.fetchProduct.error ::', error);
        throw error;
    }
}
export const fetchSingleProduct = async (productCode:string, _token:string) => {
    const url =  `${import.meta.env.VITE_APP_PRODUCT_BASE_URL_V1}/products?RestaurantCode=${restaurantCode}&ProductCode=${productCode}`;
    const authStore = useAuthStore()

    try {
        const response = await axios (url, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "API_KEY": _token
            },
            method: "GET",
        });
        return response.data.body.results;
    } catch (error) {
        console.error('Database.fetchProduct.error ::', error);
        throw error;
    }
}

export const deleteProduct = async (Code: any[], _token:string) => {
    const url =  `${import.meta.env.VITE_APP_PRODUCT_BASE_URL_V1}/products`;
    const authStore = useAuthStore()
    try {
        const response = await axios.delete(url,{
            data: { 
                products:Code
            },
            headers: {
                'Content-Type': 'application/json',
                "API_KEY": _token
            }
        });
        return response.data.body;
    } catch (error) {
        console.error('Database.deletePlate.error ::', error);
        throw error;
    }
}

export const createProduct = async (payload: any, _token:string) => {
    const url =  `${import.meta.env.VITE_APP_PRODUCT_BASE_URL_V1}/products`;
    const authStore = useAuthStore()
    try {
        const response = await axios.post(url, { 
            products: [payload]
        }, {
            headers: {
                'Content-Type': 'application/json',
                "API_KEY": _token
            }
        });
        return response.data.body;
    } catch (error) {
        console.error('Database.createProduct.error ::', error);
        throw error;
    }
};
export const updateProduct = async (payload: any, _token:string) => {
    const url =  `${import.meta.env.VITE_APP_PRODUCT_BASE_URL_V1}/products`;
    const authStore = useAuthStore()
    try {
        const response = await axios.put(url, { 
            product: payload
        }, {
            headers: {
                'Content-Type': 'application/json',
                "API_KEY": _token
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
export const createContent = async (payload: Content[] | PlateContent[], _token:string) => {
    const url =  `${import.meta.env.VITE_APP_CONFIG_BASE_URL_V1}/contents`;
    const authStore = useAuthStore()
    console.log('Database.createConsistency.createContent.payload', payload)
    try {
        const response = await axios.post(url, { 
            Contents: payload
        }, {
            headers: {
                'Content-Type': 'application/json',
                "API_KEY": _token
            }
        });
        console.error('database.createContent', response.data.body)
        return response.data;
    } catch (error) {
        console.error('Database.Content.createContent.error ::', error);
        throw error;
    }
    
}
export const updateContent = async (payload: Content [] | PlateContent[], _token:string) => {
    const url =  `${import.meta.env.VITE_APP_CONFIG_BASE_URL_V1}/contents`;
    const authStore = useAuthStore()
    console.log('Database.createConsistency.createContent.payload', payload)
    try {
        const response = await axios.put(url, { 
            Content: payload
        }, {
            headers: {
                'Content-Type': 'application/json',
                "API_KEY": _token
            }
        });
        console.error('database.createContent', response.data.body)
        return response.data;
    } catch (error) {
        console.error('Database.Content.updateContent.error ::', error);
        throw error;
    }
    
}
export const fetchContent = async (plateCode:String, _token:string) => {
    const url =  `${import.meta.env.VITE_APP_CONFIG_BASE_URL_V1}/contents?PlateCode=${plateCode}`;
    console.log('codeplate', plateCode)
    const authStore = useAuthStore()
    try {
        const response = await axios (url, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "API_KEY": _token
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
    console.log('uploadContent', file)  
    const cloudName = import.meta.env.VITE_APP_CLOUD_NAME; // Remplacez par votre Cloud Name
    const uploadPreset = import.meta.env.VITE_APP_UPLOAD_PRESET_KEY
    console.log('upload preset', uploadPreset)

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
export const fetchConfig = async (_token:string) => {
    const url =  `${import.meta.env.VITE_APP_CONFIG_BASE_URL_V1}/configs?categories=true&QuantityUnit=true&&RestaurantCode=${restaurantCode}`;
    const authStore = useAuthStore()
    try {
        const response = await axios (url, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "API_KEY": _token
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

export const fetchCategoriePlate = async (_token:string) => {
    const url =  `${import.meta.env.VITE_APP_CATEGORIE_BASE_URL_V1}/plat-categories?RestaurantCode=${restaurantCode}`;
    const authStore = useAuthStore()
    try {
        const response = await axios (url, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "API_KEY": _token
            },
            method: "GET",
        });
        return response.data.body.results
    } catch (error) {
        console.error('Database.fetchProduct.error ::', error);
        throw error;
    }
}
export const createCategoriePlate = async (payload:Categorieplat[], _token:string) => {
    const url =  `${import.meta.env.VITE_APP_CATEGORIE_BASE_URL_V1}/plat-categories`;
    const authStore = useAuthStore()
    console.log('Database.createConsistency.createContent.payload', payload)
    try {
        const response = await axios.post(url, { 
            PlatCategories: payload
        }, {
            headers: {
                'Content-Type': 'application/json',
                "API_KEY": _token
            }
        });
        console.error('database.createContent', response.data.body)
        return response.data;
    } catch (error) {
        console.error('Database.Content.createContent.error ::', error);
        throw error;
    }
    
}
export const updateCategoriePlat = async (payload:Categorieplat,_token:string) => {
    const url =  `${import.meta.env.VITE_APP_CATEGORIE_BASE_URL_V1}/plat-categories`;
    const authStore = useAuthStore()
    console.log('Database.createConsistency.createContent.payload', payload)
    try {
        const response = await axios.put(url, { 
            PlatCategory: payload
        }, {
            headers: {
                'Content-Type': 'application/json',
                "API_KEY": _token
            }
        });
        console.error('database.createContent', response.data.body)
        return response.data;
    } catch (error) {
        console.error('Database.Content.updateContent.error ::', error);
        throw error;
    }
    
}
export const deleteCategoriePlat = async (Code: any[], _token:string) => {
    const url =  `${import.meta.env.VITE_APP_CATEGORIE_BASE_URL_V1}/plat-categories`;
    const authStore = useAuthStore()
    try {
        const response = await axios.delete(url,{
            data: { 
                PlatCategories: Code
            },
            headers: {
                'Content-Type': 'application/json',
                "API_KEY": _token
            }
        });
        return response.data.body;
    } catch (error) {
        console.error('Database.createMenu.error ::', error);
        throw error;
    }
}

//dashboard

export const fetchPopularplate = async (_token:string) => {
    const url =  `${import.meta.env.VITE_APP_DASHBOARD_BASE_URL_V1}/popular-plats?RestaurantCode=${restaurantCode}`;
    const authStore = useAuthStore()
    try {
        const response = await axios (url, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "API_KEY": _token
            },
            method: "GET",
        });
        return response.data.body
    } catch (error) {
        console.error('Database.popularplate.error ::', error);
        throw error;
    }
}

export const fetchDayCommande = async (_token:string) => {
    const url =  `${import.meta.env.VITE_APP_DASHBOARD_BASE_URL_V1}/orders?RestaurantCode=${restaurantCode}`;
    const authStore = useAuthStore()
    try {
        const response = await axios (url, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "API_KEY": _token
            },
            method: "GET",
        });
        return response.data.body
    } catch (error) {
        console.error('Database.oders.error ::', error);
        throw error;
    }
}
export const fetchTotalMenu = async (_token:string) => {
    const url =  `${import.meta.env.VITE_APP_DASHBOARD_BASE_URL_V1}/menus?RestaurantCode=${restaurantCode}`;
    const authStore = useAuthStore()
    try {
        const response = await axios (url, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "API_KEY": _token
            },
            method: "GET",
        });
        return response.data.body
    } catch (error) {
        console.error('Database.totalMenu.error ::', error);
        throw error;
    }
}
export const fetchRecentOrder = async (_token:string) => {
    const url =  `${import.meta.env.VITE_APP_DASHBOARD_BASE_URL_V1}/recent-orders?RestaurantCode=${restaurantCode}`;
    const authStore = useAuthStore()
    try {
        const response = await axios (url, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "API_KEY": _token
            },
            method: "GET",
        });
        return response.data.body.results
    } catch (error) {
        console.error('Database.popularplate.error ::', error);
        throw error;
    }
}

//invoice

export const fetchinvoice = async (ordercode: string, _token:string) => {
    const url = `${import.meta.env.VITE_APP_INVOICE_BASE_URL_v1}/invoice/item?OrderCode=${ordercode}`;
    console.log('fetchinvoice', ordercode)
    const authStore = useAuthStore()
    try {
        const response = await axios.get(url, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "API_KEY": _token
            },
        });
        
        if (response.data.exit !== "OK") {
            throw new Error(response.data.message || "API request failed");
        }
        
        return response; // Retourner toute la réponse Axios
    } catch (error) {
        console.error('Database.invoice.error ::', error);
        throw error;
    }
}

//stocks

export const createstocks = async (payload:Stocks[], _token:string) => {
    const url =  `${import.meta.env.VITE_APP_STOCKS_BASE_URL_V1}/Entries/Add?RestaurantCode=${restaurantCode}`;
    const authStore = useAuthStore()
    console.log('Database.createConsistency.createContent.payload', payload)
    try {
        const response = await axios.post(url, { 
            products:payload
        }, {
            headers: {
                'Content-Type': 'application/json',
                "API_KEY": _token    
            }
        });
        console.error('database.createStocks', response.data)
        return response.data;
    } catch (error) {
        console.error('Database.createStocks.error ::', error);
        throw error;
    }        
}

export const fetchStocks = async (_token:string) => {
    const url =  `${import.meta.env.VITE_APP_STOCKS_BASE_URL_V1}/Dashboard?RestaurantCode=${restaurantCode}&StartDate=2025-06-18 13:51:44&Limit=30&Offset=0&OrderBy=Quantity&OrderMode=DESC`;
    const authStore = useAuthStore()
    try {
        const response = await axios (url, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "API_KEY": _token
            },
            method: "GET",
        });
        return response.data.body
    } catch (error) {
        console.error('Database.fetchstocks.error ::', error);
        throw error;
    }
}

//Table

export const createTable= async (payload:Table, _token:string) => {
    const url =  `${import.meta.env.VITE_APP_RESTO_BASE_URL_V1}/restaurants/tables?RestaurantCode=${restaurantCode}`;
    const authStore = useAuthStore()
    console.log('Database.createTable.payload', payload)
    try {
        const response = await axios.post(url, { 
            table: payload
        }, {
            headers: {
                'Content-Type': 'application/json',
                "API_KEY": _token
            }
        });
        console.error('database.createTable', response.data.body)
        return response.data;
    } catch (error) {
        console.error('Database.Content.createTable.error ::', error);
        throw error;
    }
    
}
export const fetchResto = async (_token:string) => {
    const url =  `${import.meta.env.VITE_APP_RESTO_BASE_URL_V1}/restaurants/Detail?RestaurantCode=${restaurantCode}`;
    const authStore = useAuthStore()
    try {
        const response = await axios (url, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "API_KEY": _token
            },  
            method: "GET",
        });
        return response.data.body
    } catch (error) {
        console.error('Database.fetchResto.error ::', error);
        throw error;
    }
}
export const updateResto = async (payload: any, _token:string) => {
    const url =  `${import.meta.env.VITE_APP_RESTO_BASE_URL_V1}/restaurants`;
    const authStore = useAuthStore()
    console.log('Database.updateResto.payload', payload)
    try {
        const response = await axios.put(url, { 
            restaurant: payload
        }, {
            headers: {
                'Content-Type': 'application/json',
                "API_KEY": _token
            }
        });
        console.error('database.updateResto', response.data.body)
        return response.data;
    } catch (error) {
        console.error('Database.updateResto.error ::', error);
        throw error;
    }
    
}
export const updateTable = async (payload:Table, _token:string) => {
    const url =  `${import.meta.env.VITE_APP_RESTO_BASE_URL_V1}/restaurants/tables?RestaurantCode=${restaurantCode}`;
    const authStore = useAuthStore()
    console.log('Database.createConsistency.createTable.payload', payload)
    try {
        const response = await axios.put(url, { 
            table: payload
        }, {
            headers: {
                'Content-Type': 'application/json',
                "API_KEY": _token
            }
        });
        console.error('database.createTable', response.data.body)
        return response.data;
    } catch (error) {
        console.error('Database.Content.updateTable.error ::', error);
        throw error;
    }
    
}
export const deleteTable = async (Code: any[], _token:string) => {
    const url =  `${import.meta.env.VITE_APP_RESTO_BASE_URL_V1}/restaurants/tables?RestaurantCode=${restaurantCode}`;
    const authStore = useAuthStore()
    try {
        const response = await axios.delete(url,{
            data: { 
                tables: Code
            },
            headers: {
                'Content-Type': 'application/json',
                "API_KEY": _token
            }
        });
        return response.data.body;
    } catch (error) {
        console.error('Database.createTable.error ::', error);
        throw error;
    }
}

// Team Resto

export const createTeam= async (payload:Team, _token:string) => {
    const url =  `${import.meta.env.VITE_APP_ADD_USER_BASE_URL_V1}/User/Add`;
    const authStore = useAuthStore()
    console.log('Database.createTeam.payload', payload)
    try {
        const response = await axios.post(url,  
            payload
        , {
            headers: {
                'Content-Type': 'application/json',
                "API_KEY": _token
            }
        });
        console.error('database.createTeam', response.data.body)
        return response.data;
    } catch (error) {
        console.error('Database.Content.createTeam.error ::', error);
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

// gestion du token
// Dans votre fichier api.ts






