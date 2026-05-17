export type CreateUserResponse = {
  id: string;
  email: string;
  username: string;
  password: string;
  created_at: Date;
  updated_at: Date;
  features: string[];
};
