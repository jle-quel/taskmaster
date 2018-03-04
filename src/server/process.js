'use strict'

const child_process = require('child_process')

const logger = require('../services/logger')
const index = require('./index')

const data = {}

const processEventsInit = (_process, processConfig) => {
	_process.on('message', (processInfo) => {
		if (processInfo.status === 'FINISH') {
			if (processConfig.autorestart === true || processInfo.code !== processConfig.exitcode)
				launcher(processConfig)
			else
				delete data[processInfo.pid]
		}
		else {
			data[processInfo.pid] = {
				'status': processInfo.status,
				'code': processInfo.code,
				'signal': processInfo.signal,
				'pid': processInfo.pid
			}
		}
	})
}

const getSpawnOptions = (configData) => ({
	'shell': true,
	'env': configData.env,
	'cwd': configData.workingdir
})

const getIoOptions = (configData) => ({
	'stderr': configData.stderr,
	'stdout': configData.stdout
})

const launcher = (processConfig) => {
	const spawnOptions = JSON.stringify(getSpawnOptions(processConfig))
	const ioOptions = JSON.stringify(getIoOptions(processConfig))

	const _process = child_process.fork('./src/server/child-process', [processConfig.cmd, spawnOptions, ioOptions])
	processEventsInit(_process, processConfig)
}

module.exports = {
	data,
	launcher
}
