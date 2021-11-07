import React, { useState, useContext, useEffect } from "react"
import styles from "../../../styles/pages/mypage/[id]/index.module.scss"
import { AuthContext } from "../../../contexts/AuthContext"
import axios from "../../../utils/axios"
import { isEmpty, isValidSelfIntro } from "../../../utils/validations"
import Image from "next/image"
import Post from "../../../components/Post"
import ProfileImage from "../../../components/ProfileImage"
import SidebarMenu from "../../../components/SidebarMenu"
import { ErrorMessage } from "../../../components/ErrorMessage"
import InfiniteScroll from "react-infinite-scroller"
import { Loader, Button, Message, Modal } from "semantic-ui-react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { library } from "@fortawesome/fontawesome-svg-core"
import { faTimesCircle, faCamera } from "@fortawesome/free-solid-svg-icons"
library.add(faTimesCircle, faCamera)

type MyPost = {
  user_id: number
  username: string
  content: string
  post_image: string
  profile_image: string
  id: number
  liked_count: number
  already_liked: boolean
  commented_count: number
}

export default function Mypage(): JSX.Element {
  const { authState, dispatch } = useContext(AuthContext)
  const [isLoading, setIsLoading] = useState(true)
  const [isDoneDeleting, setIsDoneDeleting] = useState(false)
  const [myPosts, setMyPosts] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [profileInputs, setProfileInputs] = useState({
    username: "",
    self_introduction: "",
    profile_image: "",
  })
  const [previewImage, setPreviewImage] = useState("")
  const [isOpenEditProfileModal, setIsOpenEditProfileModal] = useState(false)
  const [errors, setErrors] = useState({
    isRequired: {
      username: false,
      self_introduction: false,
    },
    isInvalid: {
      username: false,
      self_introduction: false,
    },
    disableButtonFlag: true,
  })
  const defaultNumberOfPosts = 20
  const defaultPageNumber = 0

  useEffect(() => {
    setIsLoading(authState.isLoading)
    if (!authState.isLoading) {
      getMyPosts(authState.user.id)
      setProfileInputs({
        ...profileInputs,
        username: authState.user.username,
        self_introduction: authState.user.self_introduction,
      })
    }
  }, [authState.isLoading])

  async function getMyPosts(
    authUserId: number,
    page: number = defaultPageNumber
  ) {
    let currentPage = page
    if (page > 0) {
      // The page number starts from 0 in backend. So I subtract 1.
      currentPage = page - 1
    }
    await axios
      .post(`/api/get_my_posts`, {
        auth_user_id: authUserId,
        page: currentPage,
      })
      .then((response: any) => {
        if (response.data.length < defaultNumberOfPosts) {
          setHasMore(false)
        }
        if (myPosts.length === 0) {
          setMyPosts(response.data)
          return
        }
        setMyPosts(myPosts.concat(response.data))
        return
      })
      .catch((e) => {
        console.error(e)
      })
  }

  function handleChange(
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) {
    const name = event.target.name
    const value = event.target.value

    errors["isRequired"][name] = false
    if (isEmpty(value)) {
      errors["isRequired"][name] = true
    }

    errors["isInvalid"][name] = false
    if (name === "self_introduction" && !isValidSelfIntro(value)) {
      errors["isInvalid"][name] = true
    }

    errors["disableButtonFlag"] = false
    if (
      Object.values(errors.isRequired).includes(true) ||
      Object.values(errors.isInvalid).includes(true)
    ) {
      errors["disableButtonFlag"] = true
    }

    setErrors({ ...errors })
    setProfileInputs({
      ...profileInputs,
      [name]: value,
    })
  }

  function handleChangeFile(e: React.ChangeEvent<HTMLInputElement>) {
    const { files, name } = e.target
    setPreviewImage(window.URL.createObjectURL(files[0]))

    errors["disableButtonFlag"] = false
    if (
      Object.values(errors.isRequired).includes(true) ||
      Object.values(errors.isInvalid).includes(true)
    ) {
      errors["disableButtonFlag"] = true
    }

    setErrors({ ...errors })
    setProfileInputs({
      ...profileInputs,
      [name]: files[0],
    })
  }

  function editUser() {
    const authUserId = authState.user.id
    const { username, self_introduction, profile_image } = profileInputs
    const formData = new FormData()
    formData.append("user_id", authUserId)
    formData.append("profile_image", profile_image)
    formData.append("username", username)
    formData.append("self_introduction", self_introduction)
    axios
      .post(`/api/update_user`, formData)
      .then((response: any) => {
        const { username, self_introduction } = response.data
        dispatch({ type: "UPDATE_USER", user: response.data })
        setProfileInputs({
          username: username,
          profile_image: "",
          self_introduction: self_introduction,
        })
        errors["disableButtonFlag"] = true
        setErrors({ ...errors })
        setPreviewImage("")
        setIsOpenEditProfileModal(false)
      })
      .catch((e) => {
        console.error(e)
      })
  }

  function updatePosts(valueObject: any, postIndex: number) {
    Object.keys(valueObject).map(function (key) {
      if (key === "liked_count" || key === "commented_count") {
        return (myPosts[postIndex][key] =
          myPosts[postIndex][key] + valueObject[key])
      }
      return (myPosts[postIndex][key] = valueObject[key])
    })
    setMyPosts([...myPosts])
  }

  function deletePost(postId: number, postIndex: number) {
    if (!confirm("本当に削除しますか?")) {
      return
    }
    axios
      .delete(`/api/posts/${postId}`)
      .then(() => {
        setIsDoneDeleting(true)
        myPosts.splice(postIndex, 1)
        setMyPosts([...myPosts])
        setTimeout(() => setIsDoneDeleting(false), 2000)
      })
      .catch((e) => {
        console.error(e)
      })
  }

  const loadMore = (page) => {
    if (myPosts.length === 0) {
      return
    }

    const authUserId = authState.user.id
    getMyPosts(authUserId, page)
  }

  const loader = (
    <div className="loader" key={0}>
      <Loader active inline />
    </div>
  )

  if (isLoading) {
    return null
  }

  const { username, profile_image, self_introduction } = authState.user
  const { disableButtonFlag, isRequired, isInvalid } = errors

  return (
    <div className={styles["mypage-wrapper"]}>
      <SidebarMenu />
      <div className={styles["center-section"]}>
        {isDoneDeleting && (
          <Message className={styles["action-message"]}>
            投稿を削除しました
          </Message>
        )}
        <div className={styles["user-profile-section"]}>
          <div className={styles["user-section"]}>
            <div className={styles["user-section-left"]}>
              <div>
                <ProfileImage
                  width={100}
                  height={100}
                  profileImage={profile_image}
                />
              </div>
              <span className={styles["user-section__name"]}>{username}</span>
            </div>
            <div className={styles["user-profile-edit"]}>
              <Button
                className={styles["user-profile-edit__button"]}
                onClick={() => setIsOpenEditProfileModal(true)}
              >
                プロフィールを編集
              </Button>
              <Modal
                onClose={() => setIsOpenEditProfileModal(false)}
                onOpen={() => setIsOpenEditProfileModal(true)}
                open={isOpenEditProfileModal}
                closeOnDimmerClick={false}
                size={"tiny"}
              >
                <div className={styles["edit-modal"]}>
                  <div className={styles["edit-modal__circle"]}>
                    <FontAwesomeIcon
                      className={styles["edit-modal__circle-icon"]}
                      icon="times-circle"
                      onClick={() => setIsOpenEditProfileModal(false)}
                    />
                  </div>
                  <span className={styles["edit-modal__title"]}>
                    プロフィールを編集
                  </span>
                  <div className={styles["edit-modal__profile"]}>
                    {previewImage ? (
                      <Image
                        className={styles["profile-image"]}
                        width={100}
                        height={100}
                        loader={() => previewImage}
                        src={previewImage}
                        alt={"Preview image"}
                      />
                    ) : (
                      <Image
                        className={styles["profile-image"]}
                        width={100}
                        height={100}
                        src={
                          profile_image
                            ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/profile-img/${profile_image}`
                            : `/profile-img/default-profile-image.png`
                        }
                        alt={"Profile image"}
                      />
                    )}
                    <label>
                      <div className={styles["profile-image-upload"]}>
                        <FontAwesomeIcon
                          className={styles["profile-image-camera-icon"]}
                          icon="camera"
                        />
                        <input
                          type="file"
                          name="profile_image"
                          accept=".jpg, .jpeg, .png"
                          onChange={(e) => handleChangeFile(e)}
                          style={{ display: "none" }}
                        />
                      </div>
                    </label>
                  </div>
                  <label htmlFor="username">ユーザーネーム</label>
                  <input
                    type="text"
                    name="username"
                    value={profileInputs.username}
                    onChange={(e) => handleChange(e)}
                    className={styles["edit-modal__input-username"]}
                  />
                  <ErrorMessage
                    isError={isRequired.username}
                    errorMessage={"ユーザーネームは入力必須項目です。"}
                  />
                  <label htmlFor="username">自己紹介</label>
                  <textarea
                    name="self_introduction"
                    value={profileInputs.self_introduction}
                    onChange={(e) => handleChange(e)}
                    className={styles["edit-modal__input-self-introduction"]}
                  />
                  <ErrorMessage
                    isError={isRequired.self_introduction}
                    errorMessage={"自己紹介は入力必須項目です。"}
                  />
                  <ErrorMessage
                    isError={isInvalid.self_introduction}
                    errorMessage={"自己紹介は160文字以内で入力してください。"}
                  />
                  <Button
                    className={styles["edit-modal__button"]}
                    onClick={() => editUser()}
                    primary
                    disabled={disableButtonFlag}
                  >
                    保存する
                  </Button>
                </div>
              </Modal>
            </div>
          </div>
          <p className={styles["self-introduction"]}>{self_introduction}</p>
        </div>
        <InfiniteScroll loadMore={loadMore} hasMore={hasMore} loader={loader}>
          {myPosts.map((myPost: MyPost, postIndex: number) => {
            return (
              <Post
                key={postIndex}
                postIndex={postIndex}
                userId={myPost.user_id}
                postId={myPost.id}
                username={username}
                postContent={myPost.content}
                postImage={myPost.post_image}
                profileImage={profile_image}
                likedCount={myPost.liked_count}
                alreadyLiked={myPost.already_liked}
                commentedCount={myPost.commented_count}
                updatePosts={updatePosts}
                deletePost={deletePost}
              />
            )
          })}
        </InfiniteScroll>
      </div>

      <div className={styles["right-section"]}></div>
    </div>
  )
}
