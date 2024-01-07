from bson import BSON
from bson.objectid import ObjectId

from apps.polls.repositories.poll_list_repository import PollListRepository
from apps.polls.repositories.user_actions_repository import UserActionsRepository
from apps.polls.utils.poll_utils import PollUtils
from apps.accounts.services.user_profile_service import UserProfileService

from utils.pagination import Pagination


class PollListService:
    repository = PollListRepository()
    user_actions_repository = UserActionsRepository()
    user_profile_service = UserProfileService()
    utils = PollUtils()
    pagination = Pagination()

    async def filter_poll_list(self, polls: list[dict], user_id: int | None = None):
        items: list[dict] = []
        for poll in polls:
            poll: dict = await self.utils.simplify_poll_data(poll=poll)
            profile: dict = await self.user_profile_service.a_get_owner(user_id=poll["user_id"])
            poll["user_profile"] = profile

            user_actions: dict = {}
            if user_id:
                projection: dict = {"_id": 0, "has_voted": 1, "has_shared": 1, "has_bookmarked": 1}
                result: BSON = await self.user_actions_repository.get_user_actions(
                    id=ObjectId(poll["id"]), user_id=user_id, projection=projection
                )

                if result != None:
                    result: dict = await self.utils.bson_to_json(bson=result)
                    user_actions = result

            item: dict = {}
            item["poll"] = poll
            item["authenticated_user_actions"] = user_actions
            items.append(item)

        return items

    async def get_by_keyword(
        self, keyword: str, page: int, page_size: int, user_id: int | None = None
    ):
        polls: list[BSON] = await self.repository.get_by_keyword(keyword=keyword, user_id=user_id)
        polls: list[dict] = await self.utils.bson_to_json(bson=polls)

        data: dict = await self.pagination.a_paginate(
            object_list=polls, page=page, page_size=page_size
        )

        items = await self.filter_poll_list(polls=data["items"], user_id=user_id)
        data["items"] = items

        return data

    async def get_user_poll_list(
        self, id: int, page: int, page_size: int, user_id: int | None = None
    ):
        polls: list[BSON] = await self.repository.get_user_poll_list(id=id, user_id=user_id)

        polls: list[dict] = await self.utils.bson_to_json(bson=polls)

        data: dict = await self.pagination.a_paginate(
            object_list=polls, page=page, page_size=page_size
        )

        items = await self.filter_poll_list(polls=data["items"], user_id=user_id)

        data["items"] = items

        return data

    async def get_user_voted_poll_list(
        self, id: int, page: int, page_size: int, user_id: int | None = None
    ):
        polls: list[BSON] = await self.repository.get_user_voted_poll_list(id=id, user_id=user_id)

        polls: list[dict] = await self.utils.bson_to_json(bson=polls)

        data: dict = await self.pagination.a_paginate(
            object_list=polls, page=page, page_size=page_size
        )

        items = await self.filter_poll_list(polls=data["items"], user_id=user_id)

        data["items"] = items

        return data

    async def get_user_shared_poll_list(
        self, id: int, page: int, page_size: int, user_id: int | None = None
    ):
        polls: list[BSON] = await self.repository.get_user_shared_poll_list(id=id, user_id=user_id)

        polls: list[dict] = await self.utils.bson_to_json(bson=polls)

        data: dict = await self.pagination.a_paginate(
            object_list=polls, page=page, page_size=page_size
        )

        items = await self.filter_poll_list(polls=data["items"], user_id=user_id)

        data["items"] = items

        return data

    async def get_user_bookmarked_poll_list(
        self, id: int, page: int, page_size: int, user_id: int | None = None
    ):
        polls: list[BSON] = await self.repository.get_user_bookmarked_poll_list(
            id=id, user_id=user_id
        )

        polls: list[dict] = await self.utils.bson_to_json(bson=polls)

        data: dict = await self.pagination.a_paginate(
            object_list=polls, page=page, page_size=page_size
        )

        items = await self.filter_poll_list(polls=data["items"], user_id=user_id)

        data["items"] = items

        return data

    async def get_category_poll_list(
        self, category: str, page: int, page_size: int, user_id: int | None = None
    ):
        polls: list[BSON] = await self.repository.get_category_poll_list(
            category=category, user_id=user_id
        )

        polls: list[dict] = await self.utils.bson_to_json(bson=polls)

        data: dict = await self.pagination.a_paginate(
            object_list=polls, page=page, page_size=page_size
        )

        items = await self.filter_poll_list(polls=data["items"], user_id=user_id)

        data["items"] = items

        return data
