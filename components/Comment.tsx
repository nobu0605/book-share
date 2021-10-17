import React, { useContext, useState } from "react"
import { AuthContext } from "../contexts/AuthContext"
import styles from "../styles/components/Comment.module.scss"
import axios from "../utils/axios"
import { isEmpty } from "../utils/validations"
import ProfileImage from "../components/ProfileImage"
import { Dropdown } from "semantic-ui-react"
import { Modal, Button } from "semantic-ui-react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { library } from "@fortawesome/fontawesome-svg-core"
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons"
library.add(faTimesCircle)

type Props = {
  commentIndex: number
  commentId: number
  userId: number
  username: string
  content: string
  profileImage: string
  postAuthorName: string
  deleteComment: (commentId: number, commentIndex: number) => void
  updateComment: (valueObject: any, commentIndex: number) => void
}

export default function Comment(props: Props): JSX.Element {
  const { authState } = useContext(AuthContext)
  const [isOpenEditCommentModal, setIsOpenEditCommentModal] = useState(false)
  const [commentInputs, setCommentInputs] = useState({
    content: "",
  })
  const [errors, setErrors] = useState({
    isRequired: {
      content: false,
    },
    disableButtonFlag: true,
  })

  function getComment(commentId) {
    axios
      .get(`/api/comments/${commentId}`)
      .then((response: any) => {
        setCommentInputs({
          content: response.data.content,
        })
        setIsOpenEditCommentModal(true)
      })
      .catch((e) => {
        console.error(e)
      })
  }

  function editComment(commentId: number, commentIndex: number) {
    const { content } = commentInputs
    axios
      .patch(`/api/comments/${commentId}`, {
        content,
      })
      .then(() => {
        props.updateComment(commentInputs, commentIndex)
        setCommentInputs({
          content: "",
        })
        setIsOpenEditCommentModal(false)
      })
      .catch((e) => {
        console.error(e)
      })
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const name = event.target.name
    const value = event.target.value

    errors["isRequired"][name] = false
    if (isEmpty(value)) {
      errors["isRequired"][name] = true
    }

    errors["disableButtonFlag"] = false
    if (Object.values(errors.isRequired).includes(true)) {
      errors["disableButtonFlag"] = true
    }

    setErrors({ ...errors })
    setCommentInputs({
      ...commentInputs,
      [name]: value,
    })
  }

  const {
    commentId,
    commentIndex,
    profileImage,
    username,
    userId,
    postAuthorName,
  } = props
  const { content } = commentInputs
  const { disableButtonFlag } = errors

  return (
    <div className={styles["comment-wrapper"]}>
      <span>返信先: {postAuthorName} さん</span>
      <div className={styles["comment-user-section"]}>
        <div className={styles["comment-user-section-left"]}>
          <ProfileImage profileImage={profileImage} />
          <span className={styles["comment-user-section__name"]}>
            {username}
          </span>
        </div>
        <div>
          {userId === authState.user.id && (
            <Dropdown
              className={styles["comment-dropdown"]}
              text={"..."}
              icon={null}
            >
              <Dropdown.Menu>
                <Dropdown.Item
                  text="コメントを編集"
                  onClick={() => getComment(commentId)}
                />
                <Dropdown.Item
                  text="コメントを削除"
                  onClick={() => props.deleteComment(commentId, commentIndex)}
                />
              </Dropdown.Menu>
            </Dropdown>
          )}
          <Modal
            onClose={() => setIsOpenEditCommentModal(false)}
            onOpen={() => setIsOpenEditCommentModal(true)}
            open={isOpenEditCommentModal}
            closeOnDimmerClick={false}
            size={"tiny"}
          >
            <div className={styles["edit-modal"]}>
              <div className={styles["edit-modal__circle"]}>
                <FontAwesomeIcon
                  className={styles["edit-modal__circle-icon"]}
                  icon="times-circle"
                  onClick={() => setIsOpenEditCommentModal(false)}
                />
              </div>
              <span className={styles["edit-modal__title"]}>
                コメントを編集
              </span>
              <div className={styles["edit-modal__profile"]}>
                <ProfileImage profileImage={profileImage} />
                <span className={styles["edit-modal__profile-name"]}>
                  {username}
                </span>
              </div>
              <input
                type="text"
                name="content"
                value={content}
                onChange={(e) => handleChange(e)}
                className={styles["edit-modal__input"]}
              />
              <Button
                className={styles["edit-modal__button"]}
                onClick={() => editComment(commentId, commentIndex)}
                primary
                disabled={disableButtonFlag}
              >
                保存する
              </Button>
            </div>
          </Modal>
        </div>
      </div>
      <div>
        <span className={styles["comment-content"]}>{props.content}</span>
      </div>
    </div>
  )
}
