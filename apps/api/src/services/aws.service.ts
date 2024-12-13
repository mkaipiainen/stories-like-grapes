import { S3RequestPresigner } from "@aws-sdk/s3-request-presigner";
import { parseUrl } from "@aws-sdk/url-parser";
import { Hash } from "@aws-sdk/hash-node";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { formatUrl } from "@aws-sdk/util-format-url";

export function AwsService() {

	return {
		generateS3Url: async (id: string, type: 'GET' | 'PUT' | 'DELETE') => {
			const s3ObjectUrl = parseUrl(`https://stories-like-grapes.s3.eu-north-1.amazonaws.com/${id}`);
			const accessKeyId = process.env.S3_ACCESS_KEY_ID
			const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
			if(accessKeyId && secretAccessKey) {
				const presigner = new S3RequestPresigner({
					credentials: {
						accessKeyId: accessKeyId,
						secretAccessKey: secretAccessKey
					},
					region: 'eu-north-1',
					sha256: Hash.bind(null, "sha256"), // In Node.js
				});
				let url = '';
				url = formatUrl(await presigner.presign(new HttpRequest({
					...s3ObjectUrl,
					method: type,
				}), {
					expiresIn: 5, // Adjust expiration time as needed
				}));
				return url;
			} else {
				throw new Error('AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be defined in env')
			}

		}
	}

}

export const awsService = AwsService();
