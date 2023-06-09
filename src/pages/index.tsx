import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";

import { api } from "y/utils/api";

import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "y/components/loading";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { PageLayout } from "y/components/layout";
import { PostView } from "y/components/postview";

const CreatePostWizard = () => {
    const { user } = useUser();

    const ctx = api.useContext();

    const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
        onSuccess: () => {
            setInput("");
            void ctx.posts.getAll.invalidate();
        },
        onError: (e) => {
            const errorMessage = e.data?.zodError?.fieldErrors.content
            if (errorMessage && errorMessage[0]) {
                toast.error(errorMessage[0])
            } else {
                toast.error("Failed to post! Please try again later")
            }
        }
    });

    const [input, setInput] = useState<string>("");

    if (!user) return null;

    return (
        <div className="flex gap-3 w-full">
            <UserButton appearance={{
                elements: {
                    userButtonAvatarBox: {
                        width: 56,
                        height: 56
                    }
                }
            }} />

            <input
                placeholder="Type some emojis!"
                className="bg-transparent grow outline-none"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        if (input !== "") {
                            mutate({ content: input });
                        }
                    }
                }}
                disabled={isPosting}
            />
            {input !== "" && !isPosting && (
                <button onClick={() => mutate({ content: input })} >
                    Post
                </button>)}

            {isPosting &&
                <div className="flex justify-center items-center">
                    <LoadingSpinner size={20} />
                </div>
            }
        </div>
    )
}

const Feed = () => {
    const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

    if (postsLoading) return <LoadingPage />;

    if (!data) return <div>Something went wrong</div>;

    return (
        <div className="flex flex-col">
            {data.map((fullPost) => (
                <PostView {...fullPost} key={fullPost.post.id} />
            ))}
        </div>
    )
}

const Home: NextPage = () => {
    const { isLoaded: userLoaded, isSignedIn } = useUser();

    // start fetching ASAP
    api.posts.getAll.useQuery();

    // Return empty div if user isn't loaded yet
    if (!userLoaded) return <div />;

    return (
        <>
            <PageLayout>
                <div className="border-b border-slate-400 p-4 flex">
                    {!isSignedIn && <div className="flex justify-center"><SignInButton /></div>}
                    {isSignedIn && <CreatePostWizard />}
                </div>
                <Feed />
            </PageLayout>
        </>
    );
};

export default Home;
