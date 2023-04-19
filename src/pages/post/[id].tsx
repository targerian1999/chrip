import { type NextPage } from "next";
import Head from "next/head";

const SinglePostPage: NextPage = () => {
    return (
        <>
            <Head>
                <title>Post - Chrip</title>
            </Head>
            <main className="flex justify-center h-screen">
                <div>
                    post view
                </div>
            </main>
        </>
    );
};

export default SinglePostPage;
