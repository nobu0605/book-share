import React, { useState } from "react"
import axios from "../utils/axios"
import { Button } from "semantic-ui-react"
import styles from "../styles/pages/index.module.scss"
import { isEmpty } from "../utils/validations"
import Link from "next/link"
import { useRouter } from "next/router"

export default function Login(): JSX.Element {
  const router = useRouter()
  const [loginInputs, setLoginInputs] = useState({
    email: null,
    password: null,
  })
  const [errors, setErrors] = useState({
    isRequired: {
      email: false,
      password: false,
    },
  })

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const name = event.target.name
    const value = event.target.value

    errors["isRequired"][name] = false
    if (isEmpty(value)) {
      errors["isRequired"][name] = true
    }

    setErrors(errors)
    setLoginInputs({
      ...loginInputs,
      [name]: value,
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const { email, password } = loginInputs

    Object.keys(loginInputs).map(function (key) {
      if (isEmpty(loginInputs[key])) {
        errors["isRequired"][key] = true
      }
    })
    setErrors({ ...errors })
    if (Object.values(errors.isRequired).includes(true)) {
      return
    }

    await axios
      .post(`/api/auth/sign_in`, {
        email,
        password,
      })
      .then((response: any) => {
        localStorage.setItem("access-token", response.headers["access-token"])
        localStorage.setItem("client", response.headers["client"])
        localStorage.setItem("uid", response.headers["uid"])

        router.push("/home")
      })
      .catch((e) => {
        console.error(e)
        if (e.response.status === 401) {
          return alert("メールアドレスもしくはパスワードが間違っています。")
        }
        return alert(
          "何らかのエラーが発生しています。申し訳ありませんが時間を空けて再度お試し下さい。"
        )
      })
  }

  const { isRequired } = errors
  return (
    <div className={styles["login-wrapper"]}>
      <div className={styles["login-input"]}>
        <span className={styles["login-input__title"]}>
          Book Shareにログイン
        </span>
        <input
          className={styles["login-input__field"]}
          placeholder="E-mail address"
          name="email"
          type="text"
          onChange={handleChange}
        />
        {isRequired.email && (
          <span style={{ color: "red" }}>
            メールアドレスは入力必須項目です。
          </span>
        )}
        <input
          className={styles["login-input__field"]}
          placeholder="Password"
          name="password"
          type="password"
          onChange={handleChange}
        />
        {isRequired.password && (
          <span style={{ color: "red" }}>パスワードは入力必須項目です。</span>
        )}
        <Button
          className={styles["login-input__button"]}
          primary
          onClick={handleSubmit}
        >
          送信
        </Button>
        <Link href={`/register`}>
          <a className={styles["login-input__register-not-yet"]}>
            登録がお済みでない方はこちら
          </a>
        </Link>
      </div>
    </div>
  )
}
