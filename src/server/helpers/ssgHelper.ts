import superJSON from "superjson";
import { createServerSideHelpers } from '@trpc/react-query/server';

import { prisma } from "y/server/db";
import { appRouter } from "y/server/api/root";

export const generateSSGHelper = () =>
    createServerSideHelpers({
        router: appRouter,
        ctx: { prisma, userId: null },
        transformer: superJSON,
    })