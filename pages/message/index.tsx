import React from "react"
import styles from "../../styles/pages/mypage/[id]/index.module.scss"
import dynamic from "next/dynamic"
const ActionCable = dynamic(() => import("../../components/ActionCable"), {
  ssr: false,
})

export default function MessagePage(): JSX.Element {
  return (
    <div className={styles["mypage-wrapper"]}>
      <ActionCable />
    </div>
  )
}
