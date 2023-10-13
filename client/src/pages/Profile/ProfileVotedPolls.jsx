// Hooks.
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useGetUserVotedPollsQuery } from "../../api/pollApiSlice";
// Components.
import PollCardGroup from "../../components/Groups/PollCardGroup/PollCardGroup";

// Page.
function ProfileVotedPolls({ id }) {
  const session = useSelector((state) => state.session);
  const [data, setData] = useState(false);

  // User Polls.
  const { data: dataPolls, isLoading } = useGetUserVotedPollsQuery(data, {
    skip: data ? false : true,
  });
  // Update data to fetchs.
  useEffect(() => {
    if (id) {
      if (session.token) {
        setData({
          headers: { Authorization: `Token ${session.token}` },
          id: id,
          // There is no support for pagination on the frontend.
          // It has not been possible to incorporate a pagination system and an infinite scroll due to lack of time and the complexity that comes with doing so.
          // page: page,
        });
      } else {
        setData({
          id: id,
          // There is no support for pagination on the frontend.
          // page: page,
        });
      }
    }
  }, [id, session.token]);

  return <PollCardGroup data={dataPolls} isLoading={isLoading} />;
}

export default ProfileVotedPolls;
