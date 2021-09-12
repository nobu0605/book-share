import React, { useState, useContext, useEffect } from "react"
import styles from "../styles/pages/home.module.scss"
import { AuthContext } from "../contexts/AuthContext"
import { Dropdown } from "semantic-ui-react"

export default function Home(): JSX.Element {
  const { state, dispatch } = useContext(AuthContext)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(state.isLoading)
  }, [state.isLoading])

  function logout(): void {
    localStorage.removeItem("uid")
    localStorage.removeItem("access-token")
    localStorage.removeItem("client")
    location.pathname = "/"
  }

  if (isLoading) {
    return null
  }

  const { username } = state.user
  return (
    <div className={styles["home-wrapper"]}>
      <Dropdown style={{}} text={username}>
        <Dropdown.Menu>
          <Dropdown.Item text="Logout" onClick={logout} />
        </Dropdown.Menu>
      </Dropdown>
      <div className={styles["home-section"]}>
        <span className={styles["home-section__title"]}>
          username
          <br />
          <br />
          {username}
        </span>
      </div>
    </div>
  )
}
