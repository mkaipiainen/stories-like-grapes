export type RawUser = {
  email: string;
  name: string;
  picture: string;
  user_id: string;
  last_password_reset: Date;
  identities: {
    provider: string;
    isSocial: boolean;
    connection: string;
    user_id: string;
  }[];
  updated_at: Date;
  nickname: string;
  email_verified: boolean;
  created_at: Date;
  last_login: Date;
  last_ip: string;
  logins_count: number;
};

export type User = {
  email: string;
  name: string;
  picture: string;
  id: string;
  nickname: string;
  email_verified: boolean;
  created_at: Date;
  last_login: Date;
};
