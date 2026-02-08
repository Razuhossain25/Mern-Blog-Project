import axios from "axios";

const useCheckAuth = async () => {
    // check loclal storage for auth token
    const token = localStorage.getItem("token");
    if(!token) {
        return false;
    }else{
        try {
            const response = await axios.get(
                "http://localhost:4000/api/v1.0.0/check-auth",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    validateStatus: () => true,
                }
            );
            if (response.status >= 400) {
                throw new Error(response.data.error);
            }
            return true;
        } catch (error) {
            console.log(error.message);
            return false;
        }
    }
}

export default useCheckAuth;