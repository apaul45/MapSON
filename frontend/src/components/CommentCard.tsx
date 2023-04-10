import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Avatar,
} from "@material-tailwind/react";

const CommentCard = () => {
  return (
    <Card color="white" shadow={false} className="w-full max-w-[20rem]">
      <CardHeader
        color="transparent"
        floated={false}
        shadow={false}
        className="mx-0 flex items-center gap-4 pt-0 pb-8"
      >
        <Avatar
          size="lg"
          variant="circular"
          src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1480&q=80"
          className="p-2"
        />
        <Typography color="black">
          &quot;Great map, I love all the custom features you added !!!&quot;
        </Typography>
      </CardHeader>
    </Card>
  );
};

export default CommentCard;
