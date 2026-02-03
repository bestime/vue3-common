import axios from "axios"
const request = axios.create({

})

export async function shareFetchLocalFile<T>(url: string){  
  return request<T>({
    baseURL: '',
    url,
  })
}