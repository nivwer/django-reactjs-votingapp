// Redux Toolkit Query config.
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Requests to Polls API.
export const pollApiSlice = createApi({
  reducerPath: "pollsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8000/polls/",
  }),
  tagTypes: ["Polls"],
  endpoints: (builder) => ({
    // CRUD Poll. //

    // Create Poll.
    createPoll: builder.mutation({
      query: (data) => ({
        url: "poll/create/",
        method: "POST",
        body: data.poll,
        headers: data.headers,
      }),
      invalidatesTags: ["Polls"],
    }),

    // Read Poll.
    readPoll: builder.query({
      query: (data) => ({
        url: `poll/read/${data.id}`,
        method: "GET",
        headers: data.headers,
      }),
    }),

    // Update Poll.
    updatePoll: builder.mutation({
      query: (data) => ({
        url: `poll/update/${data.poll_id}`,
        method: "PATCH",
        body: data.poll,
        headers: data.headers,
      }),
      invalidatesTags: ["Polls"],
    }),

    // Delete Poll.
    deletePoll: builder.mutation({
      query: (data) => ({
        url: `poll/delete/${data.id}`,
        method: "DELETE",
        headers: data.headers,
      }),
      invalidatesTags: ["Polls"],
    }),

    // GET Polls. //

    // Get User Polls.
    getUserPolls: builder.query({
      query: (data) => ({
        url: `user/${data.username}`,
        method: "GET",
        headers: data.headers,
      }),
      providesTags: ["Polls"],
    }),

    // Vote manager //

    // Add user vote.
    addUserVote: builder.mutation({
      query: (data) => ({
        url: `poll/vote/add/${data.poll_id}`,
        method: "POST",
        headers: data.headers,
        body: data.body,
      }),
      invalidatesTags: ["Polls"],
    }),

    // Update user vote.
    updateUserVote: builder.mutation({
      query: (data) => ({
        url: `poll/vote/update/${data.poll_id}`,
        method: "PATCH",
        headers: data.headers,
        body: data.body,
      }),
      invalidatesTags: ["Polls"],
    }),
  }),
});

export const {
  useGetUserPollsQuery,
  useCreatePollMutation,
  useReadPollMutation,
  useUpdatePollMutation,
  useDeletePollMutation,
  useAddUserVoteMutation,
  useUpdateUserVoteMutation,
} = pollApiSlice;
