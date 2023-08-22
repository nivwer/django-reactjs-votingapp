// Redux Toolkit Query config.
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Requests to Polls API.
export const pollApiSlice = createApi({
  reducerPath: "pollsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8000/poll/",
  }),
  endpoints: (builder) => ({
    // Create Poll.
    createPoll: builder.mutation({
      query: (data) => ({
        url: "create/",
        method: "POST",
        body: data.poll,
        headers: {
          Authorization: `Token ${data.token}`,
        },
      }),
    }),

    // Read Poll.
    readPoll: builder.mutation({
      query: (data) => ({
        url: `read/${data.id}`,
        method: "GET",
        headers: {
          Authorization: `Token ${data.token}`,
        },
      }),
    }),

    // Update Poll.
    updatePoll: builder.mutation({
      query: (data) => ({
        url: "update/",
        method: "PATCH",
        body: data,
      }),
    }),

    // Delete Poll.
    deletePoll: builder.mutation({
      query: (data) => ({
        url: "delete/",
        method: "DELETE",
        body: data,
      }),
    }),
  }),
});

export const { useCreatePollMutation, useReadPollMutation } = pollApiSlice;
