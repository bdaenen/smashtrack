const { Model, transaction/*, snakeCaseMappers*/ } = require('objection');

class BaseModel extends Model {
    static get idColumn() {
        return 'id';
    }

    /*static get columnNameMappers() {
        return snakeCaseMappers({ upperCase: false });
    }*/

    static get modelPaths() {
        return [__dirname];
    }

    static toApi(eagerRecord) {
      return eagerRecord;
    }

    static get eagerListFields() {
        return '';
    }

    static get eagerDetailFields() {
        return '';
    }

    static async upsertFromApi(apiRequest) {
        return await transaction(this.knex(), async (trx) => {
            let graph = this.apiRequestToGraph(apiRequest);
            return await this.query(trx).upsertGraph(graph, {relate: true});
        })
    }

    static apiRequestToGraph(apiRequest) {
        return apiRequest.data;
    }

    /**
     * Get a list of entities, with pagination and ordering applied from the request.
     * @param apiRequest
     * @returns {Promise<BaseModel[]>}
     */
    static async getList(apiRequest) {
        return await apiRequest.applyRequestParamsToQuery(
          this.query().eager(this.eagerListFields)
        )
    }

    /**
     * Get a specific entity by id, with the pagination and ordering applied from the request.
     * @param id
     * @param [apiRequest]
     * @returns {Promise<BaseModel[]>}
     */
    static async getDetail(id, apiRequest) {
        if (apiRequest) {
            return await apiRequest.applyRequestParamsToQuery(this.query().eager(this.eagerDetailFields).where(this.idColumn, id));
        }
        return await this.query().eager(this.eagerDetailFields).where(this.idColumn, id);
    }
}

module.exports = BaseModel;
