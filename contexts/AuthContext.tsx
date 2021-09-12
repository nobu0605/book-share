import React, { createContext, FC, useEffect, useReducer } from "react"
import { useRouter } from "next/router"
import AuthReducer from "../reducers/AuthReducer"
import axios from "../utils/axios"

const AuthContext = createContext<any | undefined>({})

const initialState = {
  user: null,
  isLoading: true,
}

const AuthProvider: FC = ({ children }) => {
  const router = useRouter()
  const [state, dispatch] = useReducer(AuthReducer, initialState)

  useEffect(() => {
    checkAuth()
  }, [router.pathname])

  function checkAuth() {
    // We can add the routes we don't want to check authentication.
    if (router.pathname === "/") {
      return
    }

    const uid = localStorage.getItem("uid")
    if (!uid) {
      return (location.pathname = "/")
    }

    axios
      .post(`/api/get_user`, {
        uid,
      })
      .then((response: any) => {
        state["user"] = response.data
        dispatch({ type: "FETCH_SUCCESS" })
      })
      .catch((e) => {
        console.error(e)
      })
  }

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext, AuthProvider }
