import { Box, Flex, Heading, Divider, VStack, SimpleGrid, HStack, Button } from "@chakra-ui/react"
import Link from "next/link"
import { Input } from "../../components/Form/Input"

import { Header } from "../../components/Header"
import { Sidebar } from "../../components/Sidebar"

import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { appendErrors, SubmitHandler, useForm } from "react-hook-form"

import { useMutation } from 'react-query'
import { api } from "../../services/api"
import { queryClient } from "../../services/queryClient"
import { useRouter } from "next/dist/client/router"

type CreateUserFormData = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

const createUserFormSchame = yup.object().shape({
    name: yup.string().required('Nome obrigatório'),
    email: yup.string().required('E-mail obrigatório').email('E-mail Invalido'),
    password: yup.string().required('Senha obrigatório').min(6, 'No mínimo 6 caracteres'),
    password_confirmation: yup.string().oneOf([
        null, yup.ref('password')
    ], "A senhas precisam ser iguais")
})


export default function CreateUser() {
    const router = useRouter()

    const createUser = useMutation(async (user: CreateUserFormData) => {
        const response = await api.post('users', {
            user: {
                ...user,
                created_ad: new Date(),
            }
        })
        return response.data.user;
    }, {
        //limpar o cache
        onSuccess: () => {
            queryClient.invalidateQueries('users')
        }
    })

    const { register, handleSubmit, formState } = useForm({
        resolver: yupResolver(createUserFormSchame)
    })

    const { errors } = formState

    const handleCreateUser: SubmitHandler<CreateUserFormData> = async (values) => {
        // await new Promise(resolve => setTimeout(resolve, 2000))
        // console.log(values)
        await createUser.mutateAsync(values)
        router.push('/users')
    }


    return (
        <Box>
            <Header />

            <Flex w='100%' my='6' maxWidth={1480} mx='auto' px='6'>
                <Sidebar />
                <Box
                    as='form'
                    onSubmit={handleSubmit(handleCreateUser)}
                    flex='1'
                    borderRadius={8}
                    bg='gray.800'
                    p={['6',
                        '8']}
                >
                    <Heading
                        size='lg'
                        fontWeight='normal'
                    >
                        Criar usuário
                    </Heading>
                    <Divider my='6' borderColor='gray.700' />
                    <VStack spacing={['6', '8']}>
                        <SimpleGrid minChildWidth='240px' spacing={['6', '8']} w='100%'>
                            <Input name='name' label='Nome completo'
                                {...register('name')}
                                error={errors.name}
                            />
                            <Input name='email' type='email' label='E-mail'
                                {...register('email')}
                                error={errors.email}
                            />
                        </SimpleGrid>

                        <SimpleGrid minChildWidth='240px' spacing={['6', '8']} w='100%'>
                            <Input name='password' type='password' label='Senha' error={errors.password}  {...register('password')} />
                            <Input name='password_confirmation' type='password' label='Confirmação de senha' error={errors.password_confirmation}  {...register('password_confirmation')} />
                        </SimpleGrid>

                    </VStack>

                    <Flex mt='8' justify='flex-end'>
                        <HStack spacing='4'>
                            <Link href='/users' passHref>
                                <Button colorScheme='whiteAlpha'>Cancelar</Button>
                            </Link>
                            <Button type='submit' colorScheme='pink' isLoading={formState.isSubmitting}>Salvar</Button>
                        </HStack>
                    </Flex>
                </Box>
            </Flex>
        </Box>
    )
}