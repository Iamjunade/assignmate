import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CommunityPost } from '../../types';
import { Avatar } from '../ui/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageSquare, Share2, MoreHorizontal, CheckCircle } from 'lucide-react';

interface CommunityPostCardProps {
    post: CommunityPost;
    onLike: (id: string) => void;
}

export const CommunityPostCard: React.FC<CommunityPostCardProps> = ({ post, onLike }) => {
    const { user } = useAuth();
    const [expanded, setExpanded] = useState(false);

    const isLiked = post.likes?.includes(user?.id || '');
    const isLongPost = post.content.length > 280;
    const displayContent = expanded || !isLongPost ? post.content : post.content.slice(0, 280) + '...';

    return (
        <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Avatar
                        src={post.user_avatar}
                        alt={post.user_handle}
                        className="size-12 rounded-full border border-gray-100"
                        fallback={post.user_handle?.charAt(0)}
                    />
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h3 className="text-base font-bold text-slate-900 leading-none">
                                {post.user_handle}
                            </h3>
                            {/* Verified Badge Mock */}
                            <CheckCircle size={16} className="text-blue-500" fill="currentColor" color="white" />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-semibold text-slate-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200">
                                {post.user_school || 'Student'}
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-400">
                                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                            </span>
                        </div>
                    </div>
                </div>
                <button className="text-gray-300 hover:text-gray-600 transition-colors">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            {/* Content */}
            <div className={`prose prose-sm max-w-none mb-4 ${!expanded ? 'cursor-pointer' : ''}`} onClick={() => !expanded && setExpanded(true)}>
                <p className="text-[15px] text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                    {displayContent}
                    {isLongPost && !expanded && (
                        <span className="text-orange-500 font-bold hover:underline ml-1">
                            Read more
                        </span>
                    )}
                </p>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-4">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => onLike(post.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${isLiked
                                ? 'bg-red-50 text-red-500'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            }`}
                    >
                        <Heart size={20} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "scale-110" : ""} />
                        <span className="text-sm font-bold">{post.likes?.length || 0} Helpful</span>
                    </button>

                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-full text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all">
                        <MessageSquare size={20} />
                        <span className="text-sm font-bold">{post.comments_count || 0} Replies</span>
                    </button>
                </div>

                <button className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50 transition-all">
                    <Share2 size={20} />
                </button>
            </div>
        </div>
    );
};
