const { Contract } = require('fabric-contract-api');
class studentenrollment extends Contract {

    async initLedger(ctx) {
        // const student = {
        //     ID: 'student1',
        //     Name: 'Michael Doe',
        //     Age: 20,
        //     Course: 'Computer Science',
        //     Number: "",
        // };
        // // Example of how to write to the world state deterministically
        // await ctx.stub.putState(student.ID, Buffer.from(JSON.stringify(student)));
    }

    // EnrollStudent adds a new student to the world state with given details.
    async enrollStudent(ctx, id, name, age, course) {
        const exists = await this.StudentExists(ctx, id);
        if (exists) {
            throw new Error(`The student with ID ${id} is already enrolled`);
        }
        const student = {
            ID: id,
            Name: name,
            Age: age,
            Course: course,
            Number: "",
        };
        const studentBuffer = Buffer.from(JSON.stringify(student));
        ctx.stub.setEvent('EnrollStudent', studentBuffer);

        await ctx.stub.putState(id, studentBuffer);
        return JSON.stringify(student);
    }

    // UpdateStudent updates an existing enrollment in the world state with provided parameters.
    async updateStudent(ctx, id, name, age, course) {
        const exists = await this.StudentExists(ctx, id);
        if (!exists) {
            throw new Error(`The student ${id} does not exist`);
        }
        const rawStudent = await ctx.stub.getState(id);
        const enrollment = JSON.parse(rawStudent.toString());
        enrollment.Name = name;
        enrollment.Age = age;
        enrollment.Course = course;
        enrollment.Number = "";
        const enrollmentBuffer = Buffer.from(JSON.stringify(enrollment));
        ctx.stub.setEvent('UpdateStudent', enrollmentBuffer);
        return ctx.stub.putState(id, enrollmentBuffer);
    }

    // DeleteStudent removes a given student from the world state.
    async deleteStudent(ctx, id) {
        const exists = await this.StudentExists(ctx, id);
        if (!exists) {
            throw new Error(`The student with ID ${id} is not enrolled`);
        }
        const student = await ctx.stub.getState(id);
        const studentBuffer = Buffer.from(JSON.stringify(student));
        ctx.stub.setEvent('DeleteStudent', studentBuffer);
        return ctx.stub.deleteState(id);
    }

    // StudentExists returns true when a student with the given ID exists in the world state.
    async StudentExists(ctx, id) {
        const studentJSON = await ctx.stub.getState(id);
        return studentJSON && studentJSON.length > 0;
    }

    // Accept enrollment and provide an Stuedent number
    async acceptEnrollment(ctx, StudentID, Number) {
        const submitter = ctx.stub.getCreator().mspid
        if (!submitter.includes('Agency')) {
            throw new Error(`Only the University can accept an enrollment`)
        }
        const enrollmentBuffer = await ctx.stub.getState(StudentID)
        const enrollmentString = enrollmentBuffer.toString()
        const enrollment = JSON.parse(enrollmentString)
        enrollment.Number = Number
        await ctx.stub.putState(StudentID, Buffer.from(JSON.stringify(enrollment)))
        return enrollment
    }

    // Function for getting back a specific student from the ledger
    // StudentID: the id of the student to get
    async getStudent(ctx, StudentID) {
        const submitter = ctx.stub.getCreator().mspid
        if (!submitter.includes('Agency')) {
            throw new Error(`Only the University can accept an enrollment`)
        }
        const student = await ctx.stub.getState(StudentID)
        if (!student || student.length === 0) {
            throw new Error(`The student ${StudentID} does not exist`)
        }
        console.info(`Student key:   ${student.ID}`)
        console.info(`Student value: ${student}`)

        ctx.stub.setEvent('getstudent', student)
        return JSON.stringify(student.toString())
    }


    // GetAllStudents returns all enrolled students found in the world state.
    async GetAllStudents(ctx) {
        const submitter = ctx.stub.getCreator().mspid
        if (!submitter.includes('Agency')) {
            throw new Error(`Only the University can accept an enrollment`)
        }
        const allResults = [];
        // Range query with an empty string for startKey and endKey does an open-ended query of all students in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}
module.exports = studentenrollment;
