import React, { useState, useContext } from "react"
import styles from "../styles/components/Post.module.scss"
import Image from "next/image"
import ProfileImage from "./ProfileImage"
import { Dropdown } from "semantic-ui-react"
import axios from "../utils/axios"
import { Modal, Button } from "semantic-ui-react"
import { isEmpty } from "../utils/validations"
import { AuthContext } from "../contexts/AuthContext"
import CommentModal from "./CommentModal"
import { useRouter } from "next/router"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { library } from "@fortawesome/fontawesome-svg-core"
import { faTimesCircle, faHeart } from "@fortawesome/free-solid-svg-icons"
import { faHeart as farHeart } from "@fortawesome/free-regular-svg-icons"
import { faComment as farComment } from "@fortawesome/free-regular-svg-icons"
library.add(faTimesCircle, faHeart, farHeart, farComment)

type Props = {
  postIndex: number
  userId: number
  postId: number
  username: string
  postContent: string
  postImage: string
  profileImage: string
  likedCount: number
  alreadyLiked: boolean
  commentedCount: number
  deletePost: (postId: number, postIndex: number) => void
  updatePosts: (valueObject: any, postIndex: number) => void
}

export default function Post(props: Props): JSX.Element {
  const { authState } = useContext(AuthContext)
  const authUserId = authState.user.id
  const [postInputs, setPostInputs] = useState({
    content: "",
    post_image: "",
  })
  const [errors, setErrors] = useState({
    isRequired: {
      content: false,
    },
    disableButtonFlag: true,
  })
  const [isOpenEditPostModal, setIsOpenEditPostModal] = useState(false)
  const [isOpenCommentModal, setIsOpenCommentModal] = useState(false)
  const router = useRouter()

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
    setPostInputs({
      ...postInputs,
      [name]: value,
    })
  }

  async function getPost(postId) {
    await axios
      .get(`/api/posts/${postId}`)
      .then((response: any) => {
        setPostInputs({
          content: response.data.content,
          post_image: response.data.post_image,
        })
        setIsOpenEditPostModal(true)
      })
      .catch((e) => {
        console.error(e)
      })
  }

  function editPost(postId: number, postIndex: number) {
    const { content } = postInputs
    axios
      .patch(`/api/posts/${postId}`, {
        content,
      })
      .then(() => {
        props.updatePosts(postInputs, postIndex)
        setPostInputs({
          content: "",
          post_image: "",
        })
        setIsOpenEditPostModal(false)
      })
      .catch((e) => {
        console.error(e)
      })
  }

  function likePost(postId: number, postIndex: number) {
    axios
      .post(`/api/likes`, {
        user_id: authUserId,
        post_id: postId,
      })
      .then(() => {
        const liked = {
          already_liked: true,
          liked_count: 1,
        }
        props.updatePosts(liked, postIndex)
      })
      .catch((e) => {
        console.error(e)
      })
  }

  function dislikePost(postId: number, postIndex: number) {
    axios
      .delete(`/api/likes/${authUserId}/${postId}`)
      .then(() => {
        const disliked = {
          already_liked: false,
          liked_count: -1,
        }
        props.updatePosts(disliked, postIndex)
      })
      .catch((e) => {
        console.error(e)
      })
  }

  const { disableButtonFlag } = errors
  const { content } = postInputs
  const {
    postIndex,
    userId,
    postId,
    postContent,
    postImage,
    username,
    profileImage,
    likedCount,
    alreadyLiked,
    commentedCount,
  } = props

  return (
    <div
      className={styles["post-wrapper"]}
      onClick={() => router.push(`/post/${postId}`)}
    >
      <div className={styles["post-user-section"]}>
        <div className={styles["post-user-section-left"]}>
          <ProfileImage profileImage={profileImage} />
          <span className={styles["post-user-section__name"]}>{username}</span>
        </div>
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          {userId === authUserId && (
            <Dropdown
              className={styles["post-dropdown"]}
              text={"..."}
              icon={null}
            >
              <Dropdown.Menu>
                <Dropdown.Item
                  text="投稿を編集"
                  onClick={() => getPost(postId)}
                />
                <Dropdown.Item
                  text="投稿を削除"
                  onClick={() => props.deletePost(postId, postIndex)}
                />
              </Dropdown.Menu>
            </Dropdown>
          )}
          <Modal
            onClose={() => setIsOpenEditPostModal(false)}
            onOpen={() => setIsOpenEditPostModal(true)}
            open={isOpenEditPostModal}
            closeOnDimmerClick={false}
            size={"tiny"}
          >
            <div className={styles["edit-modal"]}>
              <div className={styles["edit-modal__circle"]}>
                <FontAwesomeIcon
                  className={styles["edit-modal__circle-icon"]}
                  icon="times-circle"
                  onClick={() => setIsOpenEditPostModal(false)}
                />
              </div>
              <span className={styles["edit-modal__title"]}>投稿を編集</span>
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
                onClick={() => editPost(postId, postIndex)}
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
        <span className={styles["post-content"]}>{postContent}</span>
        {postImage && (
          <Image
            width={170}
            height={240}
            src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/post-img/${postImage}`}
            alt={"Post image"}
          />
        )}
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <FontAwesomeIcon
            className={styles["comment-icon"]}
            icon={farComment}
            onClick={() => setIsOpenCommentModal(true)}
          />
          <span
            className={`${styles["count-text"]} ${styles["commented-count"]}`}
          >
            {commentedCount}
          </span>
          <CommentModal
            postProfileImage={profileImage}
            postUsername={username}
            postContent={postContent}
            postId={postId}
            postIndex={postIndex}
            isOpenCommentModal={isOpenCommentModal}
            setIsOpenCommentModal={setIsOpenCommentModal}
            updatePosts={props.updatePosts}
          />
          {alreadyLiked ? (
            <FontAwesomeIcon
              className={styles["liked-heart"]}
              icon={faHeart}
              onClick={() => dislikePost(postId, postIndex)}
            />
          ) : (
            <FontAwesomeIcon
              className={styles["heart"]}
              icon={farHeart}
              onClick={() => likePost(postId, postIndex)}
            />
          )}
          <span className={styles["count-text"]}>{likedCount}</span>
        </div>
      </div>
    </div>
  )
}
