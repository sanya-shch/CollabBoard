import { getBoards } from "@/actions/board";

import { NewBoardButton } from "./new-board-button";
import { BoardCard } from "./board-card";
import { EmptyBoards } from "./empty-boards";
import { EmptyFavorites } from "./empty-favorites";
import { EmptySearch } from "./empty-search";

interface BoardListProps {
  organizationId: string;
  query: { search?: string; favorites?: string };
}

export const BoardList = async ({ organizationId, query }: BoardListProps) => {
  const boards = await getBoards(organizationId, query);

  if (!boards.length && query.search) {
    return <EmptySearch />;
  }

  if (!boards.length && query.favorites) {
    return <EmptyFavorites />;
  }

  if (!boards.length) {
    return <EmptyBoards organizationId={organizationId} />;
  }

  return (
    <div>
      <h2 className="text-3xl">{query.favorites ? "Favorite boards" : "Team boards"}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mt-8 pb-10">
        {!query.favorites && <NewBoardButton organizationId={organizationId} />}

        {boards.map((board) => (
          <BoardCard
            key={board.id}
            id={board.id}
            title={board.title}
            imageUrl={board.imageUrl}
            authorName={board.authorName}
            createdAt={board.createdAt}
            isFavorite={board.favoritedBy.length > 0}
          />
        ))}
      </div>
    </div>
  );
};
