const request = require('supertest');
const { expect } = require('chai'); 

 describe('Graphql API - Transfer Mutation - External', () => {
     let token;
     let baseUrl = 'http://localhost:4000';

     beforeEach(async () => {
         const loginMutation = `mutation LoginUser($username: String!, $password: String!) {
             loginUser(username: $username, password: $password) {
                 token
             }
         }`;

         const loginVariables = {
             username: "julio", 
             password: "123456"
         };

         const respostaLogin = await request(baseUrl)
             .post('/graphql')
             .send({
                 query: loginMutation,
                 variables: loginVariables
             });
         
         token = respostaLogin.body.data.loginUser.token;
         //console.log(token)
     });
     
     
     it('Ao informar valores válidos tenho sucesso e status code 200', async () => {
        const resposta = await request(baseUrl) 
            .post('/graphql')
            .set('Authorization', `Bearer ${token}`)
            .send({ 
                query: `mutation CreateTransfer($from: String!, $value: Float!, $to: String!) {
                        createTransfer(from: $from, value: $value, to: $to) {
                            from
                            to
                            value
  }
}`,
                variables: {
                    from: "julio",
                    to: "priscila",
                    value: 10
                }
            })

        expect(resposta.status).to.equal(200)
        const respostaEsperada = require('../fixture/respostas/quandoInformoValoresValidosNoMutationReceboStatusCode200.json')
        expect(resposta.body).to.deep.equal(respostaEsperada);
     });

     it('Transferência de valores superiores ao saldo, logo tenho mensagem de Saldo Insuficiente.', async () => {
        const resposta = await request(baseUrl) 
            .post('/graphql')
            .set('Authorization', `Bearer ${token}`)
            .send({ 
                query: `mutation CreateTransfer($from: String!, $value: Float!, $to: String!) {
                        createTransfer(from: $from, value: $value, to: $to) {
                            from
                            to
                            value
  }
}`,
                variables: {
                    from: "julio",
                    to: "priscila",
                    value: 200000
                }
            })

        expect(resposta.status).to.equal(200)
        expect(resposta.body).to.have.nested.property('errors[0].message', 'Saldo insuficiente')

     });

     it('Se eu não informar um token recebo a mensagem de Autenticação obrigatória', async () => {
        const resposta = await request(baseUrl) 
            .post('/graphql')
            //.set('Authorization', `Bearer ${token}`)
            .send({ 
                query: `mutation CreateTransfer($from: String!, $value: Float!, $to: String!) {
                        createTransfer(from: $from, value: $value, to: $to) {
                            from
                            to
                            value
  }
}`,
                variables: {
                    from: "julio",
                    to: "priscila",
                    value: 10
                }
            })

        expect(resposta.status).to.equal(200)
        expect(resposta.body).to.have.nested.property('errors[0].message', 'Autenticação obrigatória')
     });
 });