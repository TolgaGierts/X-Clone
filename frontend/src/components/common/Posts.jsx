import { useEffect } from 'react';
import Post from '../../components/common/Post';
import PostSkeleton from '../../components/skeletons/PostSkeleton';

import { useQuery } from '@tanstack/react-query';

const Posts = ({ feedtype }) => {
  const getPostEndpoint = () => {
    switch (feedtype) {
      case 'forYou':
        return '/api/posts/all';
      case 'following':
        return '/api/posts/following';
      default:
        return '/api/posts/all';
    }
  };

  const POST_ENDPOINT = getPostEndpoint();

  const {
    data: posts,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      try {
        const response = await fetch(POST_ENDPOINT, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Something went wrong');
        console.log(data);
        return data;
      } catch (error) {
        console.log(error);
        throw new Error(error.message);
      }
    },
    retry: false,
  });

  useEffect(() => {
    refetch();
  }, [feedtype, refetch]);

  return (
    <>
      {isLoading ||
        (isRefetching && (
          <div className='flex flex-col justify-center'>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ))}
      {!isLoading && !isRefetching && posts?.length === 0 && (
        <p className='text-center my-4'>No posts in this tab. Switch 👻</p>
      )}
      {!isLoading && !isRefetching && posts && (
        <div>
          {posts.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
};
export default Posts;
