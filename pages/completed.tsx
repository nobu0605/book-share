import React from "react"
import styles from "../styles/pages/completed.module.scss"
import { Button } from "semantic-ui-react"
import Link from "next/link"

export default function Completed(): JSX.Element {
  return (
    <div className={styles["completed-wrapper"]}>
      <div className={styles["completed-container"]}>
        <span className={styles["completed-message"]}>
          登録が完了しました。
        </span>
        <Link href={`/`}>
          <a className={styles["completed-button-section"]}>
            <Button className={styles["completed-button-to-login"]} primary>
              利用を開始する
            </Button>
          </a>
        </Link>
      </div>
    </div>
  )
}
