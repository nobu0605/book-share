import React, { useState, useContext } from "react"
import styles from "../styles/components/CommentModal.module.scss"
import ProfileImage from "./ProfileImage"
import axios from "../utils/axios"
import { isEmpty } from "../utils/validations"
import { AuthContext } from "../contexts/AuthContext"
import { Modal, Button, Message } from "semantic-ui-react"
import { CommentType } from "../types/comment"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { library } from "@fortawesome/fontawesome-svg-core"
import { faTimesCircle, faHeart } from "@fortawesome/free-solid-svg-icons"
import { faHeart as farHeart } from "@fortawesome/free-regular-svg-icons"
import { faComment as farComment } from "@fortawesome/free-regular-svg-icons"
library.add(faTimesCircle, faHeart, farHeart, farComment)

type Props = {
  postIndex: number
  postId: number
  postUsername: string
  postContent: string
  postProfileImage: string
  isOpenCommentModal: boolean
  setIsOpenCommentModal: (isOpenCommentModal: boolean) => void
  updatePost?: (valueObject: any) => void
  updatePosts?: (valueObject: any, postIndex: number) => void
  addComment?: (comment: CommentType) => void
}

export default function CommentModal(props: Props): JSX.Element {
  const { authState } = useContext(AuthContext)
  const [comment, setComment] = useState("")
  const [isDoneCommenting, setIsDoneCommenting] = useState(false)
  const [errors, setErrors] = useState({
    isRequired: {
      content: false,
    },
    disableButtonFlag: true,
  })

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value
    const name = event.target.name

    errors["isRequired"][name] = false
    if (isEmpty(value)) {
      errors["isRequired"][name] = true
    }

    errors["disableButtonFlag"] = false
    if (Object.values(errors.isRequired).includes(true)) {
      errors["disableButtonFlag"] = true
    }

    setErrors({ ...errors })
    setComment(value)
  }

  function createComment(postId: number, postIndex: number) {
    axios
      .post(`/api/comments`, {
        user_id: authState.user.id,
        post_id: postId,
        content: comment,
      })
      .then((response: any) => {
        const comment = {
          commented_count: 1,
        }
        if (props.addComment) {
          props.addComment(response.data)
        }

        if (props.updatePosts) {
          props.updatePosts(comment, postIndex)
        } else {
          props.updatePost(comment)
        }

        setComment("")
        props.setIsOpenCommentModal(false)
        setIsDoneCommenting(true)
        setTimeout(() => setIsDoneCommenting(false), 2000)
      })
      .catch((e) => {
        console.error(e)
      })
  }

  const {
    postProfileImage,
    postUsername,
    postContent,
    postId,
    postIndex,
    isOpenCommentModal,
    setIsOpenCommentModal,
  } = props
  const authUserProfileImage = authState.user.profile_image
  const authUsername = authState.user.username
  const { disableButtonFlag } = errors

  return (
    <>
      {isDoneCommenting && (
        <Message className={styles["action-message"]}>コメントしました</Message>
      )}
      <Modal
        onClose={() => setIsOpenCommentModal(false)}
        onOpen={() => setIsOpenCommentModal(true)}
        open={isOpenCommentModal}
        closeOnDimmerClick={false}
        size={"tiny"}
      >
        <div className={styles["comment-modal-wrapper"]}>
          <div className={styles["comment-modal__circle"]}>
            <FontAwesomeIcon
              className={styles["comment-modal__circle-icon"]}
              icon="times-circle"
              onClick={() => setIsOpenCommentModal(false)}
            />
          </div>
          <div className={styles["comment-modal__profile"]}>
            <ProfileImage profileImage={postProfileImage} />
            <span className={styles["comment-modal__profile-name"]}>
              {postUsername}
            </span>
          </div>
          <span>{postContent}</span>
        </div>
        <div className={styles["comment-modal-wrapper"]}>
          <div className={styles["comment-modal__profile"]}>
            <ProfileImage profileImage={authUserProfileImage} />
            <span className={styles["comment-modal__profile-name"]}>
              {authUsername}
            </span>
          </div>
          <input
            type="text"
            className={styles["comment-modal__input"]}
            onChange={(e) => handleChange(e)}
          />
          <Button
            className={styles["comment-modal__button"]}
            onClick={() => createComment(postId, postIndex)}
            primary
            disabled={disableButtonFlag}
          >
            返信
          </Button>
        </div>
      </Modal>
    </>
  )
}
