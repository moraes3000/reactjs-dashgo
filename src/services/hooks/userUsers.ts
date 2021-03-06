import { useQuery } from "react-query";
import { api } from "../api";

type User = {
  id: string;
  name: string;
  email: string;
  create_at: string;
  avatar: string;
}

type GetUserResponse = {
  totalCount: number;
  users: User[];
}

export async function getUsers(page: number): Promise<GetUserResponse> {

  const { data, headers } = await api.get('users', {
    params: {
      page,
    }
  })

  const totalCount = Number(headers['x-total-count'])

  const users = data.users.map(user => {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      create_at: new Date(user.create_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    }
  });
  return {
    users,
    totalCount,
  };
}

export function useUsers(page: number) {
  return useQuery(['users', page], () => getUsers(page), {
    staleTime: 1000 * 5 //5 segundos não atualiza
  })
}