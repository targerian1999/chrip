import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "y/utils/api";
import { PageLayout } from "y/components/layout";
import Image from "next/image";
import { LoadingPage } from "y/components/loading";
import { PostView } from "y/components/postview";
import { generateSSGHelper } from "y/server/helpers/ssgHelper";
import Error from "next/error";

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId,
  })

  if (isLoading) return <LoadingPage />

  if (!data || data.length === 0) return <div>User has not posted</div>

  return <div className="flex flex-col">
    {data.map(fullPost => (<PostView {...fullPost} key={fullPost.post.id} />))}
  </div>
}

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({ username })

  if (!data || !data.username) return <div><Error statusCode={404} /></div>

  return (
    <>
      <Head>
        <title>{`@${data.username}`} - Profile</title>
      </Head>
      <PageLayout>

        <div className="h-36 bg-slate-600 relative">
          <Image
            src={data.profileImageUrl}
            alt={`${data.username}'s profile pic`}
            width={128}
            height={128}
            className="-mb-[64px] absolute bottom-0 left-0 ml-4 rounded-full border-4 border-black"
          />
        </div>
        <div className="h-[64px]"></div>
        <div className="p-4 text-2xl font-bold">
          {`@${data.username}`}
        </div>
        <div className="w-full border-b border-slate-400" />
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const slug = context.params?.slug

  if (typeof slug !== "string") {
    return { notFound: true };
  }

  const username = slug.replace("@", "");

  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    }
  }
}

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking"
  }
}

export default ProfilePage;
