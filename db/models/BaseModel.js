const { Model/*, snakeCaseMappers*/ } = require('objection');

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
        let resultQb = this.query().eager(this.eagerDetailFields).where(this.idColumn, id);
        let result;
        if (apiRequest) {
            result = apiRequest.applyRequestParamsToQuery(resultQb);
        }

        return await result;
    }
}

module.exports = BaseModel;
