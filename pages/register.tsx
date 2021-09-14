import React, { useState } from "react"
import axios from "../utils/axios"
import { Button } from "semantic-ui-react"
import styles from "../styles/pages/register.module.scss"
import { isEmpty, isValidPassword, isValidEmail } from "../utils/validations"
import { useRouter } from "next/router"
import { ErrorMessage } from "../components/ErrorMessage"

export default function Register(): JSX.Element {
  const router = useRouter()
  const [registerInputs, setRegisterInputs] = useState({
    email: null,
    password: null,
    username: null,
    confirm_password: null,
  })
  const [errors, setErrors] = useState({
    isRequired: {
      email: false,
      password: false,
      username: false,
      confirm_password: false,
    },
    isMismatch: {
      password: false,
      confirm_password: false,
    },
    isInvalid: {
      email: false,
      password: false,
      confirm_password: false,
    },
  })

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const name = event.target.name
    const value = event.target.value

    errors["isRequired"][name] = false
    if (isEmpty(value)) {
      errors["isRequired"][name] = true
    }

    errors["isInvalid"][name] = false
    if (name === "email" && !isValidEmail(value)) {
      errors["isInvalid"][name] = true
    }
    if (name === "password" || name === "confirm_password") {
      errors["isMismatch"]["password"] = false
      errors["isMismatch"]["confirm_password"] = false

      if (!isValidPassword(value)) {
        errors["isInvalid"][name] = true
      }
    }

    setErrors({ ...errors })
    setRegisterInputs({
      ...registerInputs,
      [name]: value,
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const { email, password, confirm_password, username } = registerInputs

    Object.keys(registerInputs).map(function (key) {
      if (isEmpty(registerInputs[key])) {
        errors["isRequired"][key] = true
      }
    })
    if (password !== confirm_password) {
      errors["isMismatch"]["password"] = true
      errors["isMismatch"]["confirm_password"] = true
    }
    if (
      Object.values(errors.isRequired).includes(true) ||
      Object.values(errors.isMismatch).includes(true) ||
      Object.values(errors.isInvalid).includes(true)
    ) {
      return setErrors({ ...errors })
    }

    await axios
      .post(`/api/auth`, {
        username,
        email,
        password,
      })
      .then(() => {
        router.push("/completed")
      })
      .catch((e) => {
        console.error(e)
        if (e.response.status === 422) {
          return alert("このメールアドレスは既に登録されています。")
        }
        return alert(
          "何らかのエラーが発生しています。申し訳ありませんが時間を空けて再度お試し下さい。"
        )
      })
  }

  const { isRequired, isInvalid, isMismatch } = errors
  return (
    <div className={styles["register-wrapper"]}>
      <div className={styles["register-input"]}>
        <span className={styles["register-input__title"]}>アカウント登録</span>
        <div className={styles["register-container"]}>
          <label className={styles["register-input__label"]} htmlFor="username">
            <span className={styles["register-input__asterisk"]}>*</span>
            ユーザーネーム
          </label>
          <input
            className={styles["register-input__field"]}
            placeholder="Username"
            name="username"
            type="text"
            onChange={handleChange}
          />
          <ErrorMessage
            isError={isRequired.username}
            errorMessage={"ユーザーネームは入力必須項目です。"}
          />
          <label className={styles["register-input__label"]} htmlFor="email">
            <span className={styles["register-input__asterisk"]}>*</span>
            メールアドレス
          </label>
          <input
            className={styles["register-input__field"]}
            placeholder="E-mail address"
            name="email"
            type="text"
            onChange={handleChange}
          />
          <ErrorMessage
            isError={isRequired.email}
            errorMessage={"メールアドレスは入力必須項目です。"}
          />
          <ErrorMessage
            isError={isInvalid.email}
            errorMessage={"無効なメールアドレスです。"}
          />
          <label className={styles["register-input__label"]} htmlFor="password">
            <span className={styles["register-input__asterisk"]}>*</span>
            パスワード
          </label>
          <input
            className={styles["register-input__field"]}
            placeholder="Password"
            name="password"
            type="password"
            onChange={handleChange}
          />
          <ErrorMessage
            isError={isRequired.password}
            errorMessage={"パスワードは入力必須項目です。"}
          />
          <ErrorMessage
            isError={isInvalid.password}
            errorMessage={
              "パスワードは半角英字と半角数字を組み合わせた6文字以上で設定してください。"
            }
          />
          <ErrorMessage
            isError={isMismatch.password}
            errorMessage={"パスワードとパスワード(確認)が一致しません。"}
          />
          <label
            className={styles["register-input__label"]}
            htmlFor="confirm_password"
          >
            <span className={styles["register-input__asterisk"]}>*</span>
            パスワード(確認)
          </label>
          <input
            className={styles["register-input__field"]}
            placeholder="Confirm password"
            name="confirm_password"
            type="password"
            onChange={handleChange}
          />
          <ErrorMessage
            isError={isRequired.confirm_password}
            errorMessage={"パスワード(確認)は入力必須項目です。"}
          />
          <ErrorMessage
            isError={isInvalid.confirm_password}
            errorMessage={
              "パスワードは半角英字と半角数字を組み合わせた6文字以上で設定してください。"
            }
          />
          <ErrorMessage
            isError={isMismatch.confirm_password}
            errorMessage={"パスワードとパスワード(確認)が一致しません。"}
          />
        </div>
        <Button
          className={styles["register-input__button"]}
          primary
          onClick={handleSubmit}
        >
          送信
        </Button>
      </div>
    </div>
  )
}
