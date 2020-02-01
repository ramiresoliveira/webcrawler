const chai = require('chai');
// const server = require('../server');

const url = `http://localhost:4000`;

chai.use(require('chai-http'))
chai.use(require('chai-as-promised'))
chai.should();
describe('Planos', () => {
  
  beforeEach(() => require('../server'));
   
  describe('/', () => {
    it('Return all fields', async() => {
      let res = await chai.request(url).post('').send({query: '{ planos { titulo valor valorUSD valorEUR data } }'})
      
      res.should.have.status(200);
      res.body.should.have.property('data');
      res.body.data.should.have.property('planos');
      res.body.data.planos[0].should.have.property('titulo');
      res.body.data.planos[0].should.have.property('valor');
      res.body.data.planos[0].should.have.property('valorUSD');
      res.body.data.planos[0].should.have.property('valorEUR');
      res.body.data.planos[0].should.have.property('data');

    });

    it('Search', async () => {
      let res = await chai.request(url).post('').send({query: '{ plano(titulo: "Cobrança") { titulo valor valorUSD valorEUR data } }'})
      
      res.should.have.status(200);
      res.body.should.have.property('data');
      res.body.data.should.have.property('plano');
      res.body.data.plano.should.have.property('titulo');
      res.body.data.plano.should.have.property('valor');
      res.body.data.plano.should.have.property('valorUSD');
      res.body.data.plano.should.have.property('valorEUR');
      res.body.data.plano.should.have.property('data');
    })
  });
});