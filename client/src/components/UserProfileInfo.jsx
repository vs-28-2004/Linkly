import React from 'react'
import { Calendar, MapPin, PenBox, MessageCircle, UserCheck, UserPlus } from 'lucide-react'
import moment from 'moment'
import Avatar from './Avatar'
import { btnOutline, btnPrimary, btnSoft } from '../lib/ui'

const UserProfileInfo = ({ user, postsCount, isOwn, isFollowing, followBusy, onEdit, onToggleFollow, onMessage }) => {
  return (
    <div className="bg-white px-6 py-6 md:px-8">
      <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
        {/* Avatar */}
        <div className="-mt-20 rounded-full border-4 border-white shadow-lg md:-mt-24">
          <Avatar user={user} size={128} />
        </div>

        {/* Info */}
        <div className="flex w-full flex-col items-center md:items-start">
          <div className="flex w-full flex-wrap items-start justify-between gap-3">
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-extrabold tracking-tight">{user.full_name}</h1>
              <p className="text-stone-500">@{user.username}</p>
            </div>

            {isOwn ? (
              <button onClick={onEdit} className={btnOutline}>
                <PenBox className="h-4 w-4" />
                Edit profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={onToggleFollow} disabled={followBusy} className={isFollowing ? btnSoft : btnPrimary}>
                  {isFollowing ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                <button onClick={onMessage} aria-label={`Message ${user.full_name}`} className={btnOutline}>
                  <MessageCircle className="h-4 w-4" />
                  Message
                </button>
              </div>
            )}
          </div>

          {user.bio && <p className="mt-4 text-sm whitespace-pre-wrap text-stone-700">{user.bio}</p>}

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-stone-500">
            {user.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {user.location}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Joined {moment(user.createdAt).format('MMMM YYYY')}
            </span>
          </div>

          {/* Stats */}
          <div className="mt-5 flex w-full gap-8 border-t border-stone-200 pt-4">
            <div>
              <span className="text-lg font-bold">{postsCount}</span>
              <span className="ml-1 text-sm text-stone-500">Posts</span>
            </div>
            <div>
              <span className="text-lg font-bold">{user.following.length}</span>
              <span className="ml-1 text-sm text-stone-500">Following</span>
            </div>
            <div>
              <span className="text-lg font-bold">{user.followers.length}</span>
              <span className="ml-1 text-sm text-stone-500">Followers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfileInfo
