"use client"
import React, { useEffect, useState } from 'react'
import styles from './component.module.css'
import PersonIcon from '@/public/assets/person-circle.svg'
import ChevronDownSvg from '@/public/assets/chevron-down.svg'
import ChevronUpSvg from '@/public/assets/chevron-up.svg'
import LogoutSvg from '@/public/assets/logout.svg'
import SettingsSvg from '@/public/assets/gear-fill.svg'
import HistorySvg from '@/public/assets/clock-history.svg'
import BookmarkSvg from '@/public/assets/bookmark-check-fill.svg'
import LoadingSvg from '@/public/assets/Eclipse-1s-200px.svg'
import { getAuth } from 'firebase/auth'
import { useAuthState } from "react-firebase-hooks/auth"
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import UserSettingsModal from '../UserSettingsModal'
import ShowUpLoginPanelAnimated from '@/app/components/UserLoginModal/animatedVariant'
import { useParams } from 'next/navigation'
import axios from 'axios'
import anilistUsers from "@/app/api/anilistUsers"

const framerMotionShowUp = {

    hidden: {
        y: "-40px",
        opacity: 0
    },
    visible: {
        y: "0",
        opacity: 1,
        transition: {
            duration: 0.2
        }
    },
    exit: {
        opacity: 0,
    }

}

function UserSideMenu() {

    const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false)
    const [isUserLoginOpen, setIsUserLoginOpen] = useState<boolean>(false)
    const [isUserSettingsOpen, setIsUserSettingsOpen] = useState<boolean>(false)

    const auth = getAuth()

    const [anilistUser, setAnilistUser] = useState<UserAnilist | undefined>(undefined)
    const [user, loading] = useAuthState(auth)

    const params = useParams()

    useEffect(() => {

        if (typeof window !== 'undefined') {

            checkUserIsLoggedWithAnilist()

        }

    }, [window, params])


    async function checkUserIsLoggedWithAnilist() {

        if (typeof window !== 'undefined') {

            const anilistUserData = localStorage.getItem("anilist-user")

            if (anilistUserData) {

                setAnilistUser(JSON.parse(anilistUserData))

                return

            }

            const anilistHashInfo = window.location.hash

            const accessToken = anilistHashInfo.slice(anilistHashInfo.search(/\baccess_token=\b/), anilistHashInfo.search(/\b&token_type\b/)).slice(13)
            const tokenType = anilistHashInfo.slice(anilistHashInfo.search(/\btoken_type=\b/), anilistHashInfo.search(/\b&expires_in\b/)).slice(11)
            const expiresIn = anilistHashInfo.slice(anilistHashInfo.search(/\bexpires_in=\b/)).slice(11)

            if (anilistHashInfo) {
                axios.post(`${window.location.origin}/api/anilist`, {
                    accessToken: accessToken,
                    tokenType: tokenType,
                    expiresIn: expiresIn
                })
            }

            const userData = await anilistUsers.getCurrUserData({ accessToken: accessToken })

            setAnilistUser(userData as UserAnilist)

        }

    }

    async function logUserOut() {

        if (anilistUser) {
            localStorage.removeItem("anilist-user")

            setAnilistUser(undefined)

            axios.delete(`${window.location.origin}/api/anilist`)

            return
        }

        auth.signOut()

    }

    return (
        <div id={styles.user_container}>

            <ShowUpLoginPanelAnimated
                apperanceCondition={isUserLoginOpen}
                customOnClickAction={() => setIsUserLoginOpen(!isUserLoginOpen)}
                auth={auth}
            />

            {(!user && !anilistUser) && (
                <React.Fragment>
                    <button
                        onClick={() => setIsUserLoginOpen(!isUserLoginOpen)}
                        aria-controls={styles.user_menu_list}
                        aria-label={isUserMenuOpen ? 'Click to Hide User Menu' : 'Click to Show User Menu'}
                        className={`display_flex_row align_items_center ${styles.heading_btn}`}
                        id={styles.user_btn}
                        data-useractive={false}
                        data-loading={loading}
                    >

                        {loading && (
                            <LoadingSvg width={16} height={16} title="Loading" />
                        )}

                        {!loading && (
                            <React.Fragment>
                                <PersonIcon className={styles.scale} alt="User Icon" width={16} height={16} />
                                <span>
                                    Login
                                </span>
                            </React.Fragment>
                        )}

                    </button>

                </React.Fragment>
            )}

            {(user || anilistUser) && (
                <React.Fragment>
                    <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        aria-controls={styles.user_menu_list}
                        aria-label={isUserMenuOpen ? 'Click to Hide User Menu' : 'Click to Show User Menu'}
                        className={`display_flex_row align_items_center ${styles.heading_btn} ${isUserMenuOpen ? `${styles.active}` : ""}`}
                        id={styles.user_btn}
                        data-useractive={true}
                    >
                        <span id={styles.img_container}>
                            <Image
                                src={user ?
                                    user.photoURL || "https://i.pinimg.com/736x/fc/4e/f7/fc4ef7ec7265a1ebb69b4b8d23982d9d.jpg"
                                    :
                                    anilistUser?.avatar.medium || "https://i.pinimg.com/736x/fc/4e/f7/fc4ef7ec7265a1ebb69b4b8d23982d9d.jpg"
                                }
                                alt={user ? user.displayName as string : anilistUser!.name}
                                fill
                                sizes='32px'
                            >
                            </Image>
                        </span>
                        <span>
                            {!isUserMenuOpen ?
                                <ChevronDownSvg /> : <ChevronUpSvg />
                            }
                        </span>
                    </button>

                    <AnimatePresence
                        initial={false}
                        mode='wait'
                    >
                        {isUserMenuOpen && (
                            <motion.div
                                variants={framerMotionShowUp}
                                id={styles.user_menu_list}
                                aria-expanded={isUserMenuOpen}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                            >

                                <ul role='menu'>
                                    <li role='menuitem' onClick={() => setIsUserMenuOpen(false)}>
                                        <Link href={"/watchlist"}>
                                            <BookmarkSvg width={16} height={16} alt={"Watchlist Icon"} /> Watchlist
                                        </Link>
                                    </li>
                                    <li role='menuitem' onClick={() => setIsUserMenuOpen(false)}>
                                        <Link href={"/history"}>
                                            <HistorySvg width={16} height={16} alt={"History Icon"} /> Latests Watched
                                        </Link>
                                    </li>
                                    <li role='menuitem' onClick={() => setIsUserMenuOpen(false)}>
                                        <button onClick={() => setIsUserSettingsOpen(true)}>
                                            <SettingsSvg width={16} height={16} alt={"Settings Icon"} /> Settings
                                        </button>
                                    </li>
                                    <li role='menuitem' onClick={() => setIsUserMenuOpen(false)}>
                                        <button onClick={() => logUserOut()}>
                                            <LogoutSvg width={16} height={16} alt={"Logout Icon"} /> Log Out
                                        </button>
                                    </li>
                                </ul>

                            </motion.div>
                        )}

                        {isUserSettingsOpen && (

                            <UserSettingsModal
                                onClick={() => setIsUserSettingsOpen(!isUserSettingsOpen)}
                                auth={auth}
                                anilistUser={anilistUser}
                                aria-expanded={isUserSettingsOpen}
                            />

                        )}

                    </AnimatePresence>
                </React.Fragment>
            )}
        </div>

    )
}

export default UserSideMenu
