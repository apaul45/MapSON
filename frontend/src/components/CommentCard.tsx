import { Card, CardBody, CardHeader, Typography } from '@material-tailwind/react';
import { Comment } from '../types';

interface Props {
  comment: Comment;
  color: string;
}

const CommentCard = ({ comment, color }: Props) => {
  return (
    <Card color="white" shadow={false} className="m-4">
      <CardHeader
        color="transparent"
        floated={false}
        shadow={false}
        className="mx-0 flex items-center gap-4 pt-0 pb-2"
      >
        <div
          className="relative ml-3 text-white flex w-12 h-9 justify-center place-items-center rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
          style={{ backgroundColor: color }}
        >
          {comment.username?.charAt(0)}
        </div>

        <div className="flex w-full flex-col gap-0.5">
          <div className="flex items-center justify-between">
            <Typography variant="h6" color="blue-gray">
              {comment.username}
            </Typography>
          </div>
        </div>
      </CardHeader>

      <CardBody className="text-black p-0 pb-2">
        <Typography color="black">{comment.comment}</Typography>
      </CardBody>
    </Card>
  );
};

export default CommentCard;
